import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import PropTypes from "prop-types";
import { TV_GUIDE_CONSTANTS } from "./constants";
import {
  generateTimelineData,
  compareTwoDates,
  getDataListFilter,
} from "./util";
import { StickyForm } from "react-native-largelist";

const today = new Date();

var timelineTimeOutRef, programsTimeOutRef;
var currentDateDisplay = new Date();
var loadingTimeoutRef;
var defaultFocusTimeoutRef;
var lastScrollHorizontalOffset = null;

function TVGuideComponent(props) {
  const {
    channeList = [],
    programList = [],
    onReachingEndChannel,
    currentDate,
    onDateChange,
    onProgramSelectedChange,
    programStylesColors,
    programContainerStyles,
    timeIndicatorStyles,
    tvGuideWidth,
    tvGuideHeight,
    timeLineHeaderHeight,
    numberOfChannelsDisplayed,
    numberOfTimelineCellDisplayed,
    channelListWidth,
    numberOfFutureDays,
    numberOfPastDays,
    containerBackroundColor,
    programLineHeight,
    sizePerPage,
    isLastPageOffset,
    renderChannel,
    renderEpgItem,
    renderTimeLineItem,
    renderLiveNowButton,
    timelineCellWidth,
    style,
    gridMargins,
  } = props;

  const timelineHeaderRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  const channelListRef = useRef(null);
  const programListRef = useRef(null);
  const largeListRef = useRef(null);
  const isFetchingVertically = useRef(null);
  const timeout = useRef(null);
  const isFetching = useRef(null);
  const [timeIndicatorOffset, setTimeIndicatorOffset] = useState(null);
  const visibleTimeIndicator = compareTwoDates(currentDate, today);
  const [visibleLoadingIndicator, setVisibleLoadingIndicator] = useState(true);
  const timeIndicatorStylesFlatten = useMemo(
    () => StyleSheet.flatten([styles.timeIndicator, timeIndicatorStyles]),
    [timeIndicatorStyles]
  );
  const containerStylesFlattten = useMemo(
    () =>
      StyleSheet.flatten([
        style,
        styles.container,
        {
          width: tvGuideWidth,
          height: tvGuideHeight,
          backgroundColor: containerBackroundColor,
        },
      ]),
    [tvGuideWidth, tvGuideHeight, containerBackroundColor]
  );
  // const timelineCellWidth = (tvGuideWidth - channelListWidth) / numberOfTimelineCellDisplayed;
  const programListContainerWidth = tvGuideWidth - channelListWidth;
  const timeLineIndicatorHeight = tvGuideHeight + timeLineHeaderHeight;
  const programLineHeightLayoutItem =
    programLineHeight +
    TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_LINE_MARGIN_BOTTOM;
  const paddingBottomContaner =
    numberOfChannelsDisplayed *
    TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_LINE_MARGIN_BOTTOM;
  const [programListIsScrolling, setProgramListIsScrolling] = useState(false);
  const [channelListState, setChannelListState] = useState([]);
  const [programListState, setProgramListState] = useState([]);
  const [dateFilterSelected, setDateFilterSelected] = useState(currentDate);
  const [dataListFilter, setDataListFilter] = useState([]);
  const [timelineData, setTimelineData] = useState([]);

  const getTimeIndicatorOffset = useCallback(() => {
    if (timelineData.length === 0) return 0;
    const now = new Date();
    return (
      (Math.abs(now.getTime() - timelineData[0].start) /
        TV_GUIDE_CONSTANTS.HALF_HOUR_DURATION) *
      (timelineCellWidth + gridMargins)
    );
  }, [timelineData]);

  const onProgramSelectedChangeCallBack = ({ index, lineIndex, program }) => {
    onProgramSelectedChange({ program });
  };

  useEffect(() => {
    // setChannelListState([...channeList]);
    const channelsState = channeList.map((channel) => ({
      channel,
      items: [""],
    }));
    setChannelListState(channelsState);
  }, [channeList]);

  useEffect(() => {
    setProgramListState([...programList]);
  }, [programList]);

  useEffect(() => {
    if (programListState.length > 0 && lastScrollHorizontalOffset == null) {
      const offsetTimeline = getTimeIndicatorOffset();
      const detalOffset =
        (numberOfTimelineCellDisplayed * timelineCellWidth) /
        numberOfTimelineCellDisplayed;
      // scrollHorizontal(Math.abs(offsetTimeline - detalOffset));
      // largeListRef.current.scrollTo({x: Math.abs(offsetTimeline - detalOffset),y: 0},false)
    }
    setVisibleLoadingIndicator(false);
  }, [programListState]);

  useEffect(() => {
    currentDateDisplay = new Date(currentDate);
    setTimelineData([...generateTimelineData(currentDateDisplay)]);
    if (visibleTimeIndicator) {
      setTimeIndicatorOffset(getTimeIndicatorOffset());
    }
  }, [currentDate]);

  const onEndReachedProgramsList = () => {
    if (isLastPageOffset === true) return;
    onReachingEndChannel();
  };

  useEffect(() => {
    if (timelineData.length > 0 && !timeIndicatorOffset) {
      setTimeIndicatorOffset(getTimeIndicatorOffset());
    }
  }, [timelineData]);

  useEffect(() => {
    console.log(timeIndicatorOffset);
  }, [timeIndicatorOffset]);

  useEffect(() => {
    setTimelineData([...generateTimelineData(currentDateDisplay)]);

    if (dataListFilter && dataListFilter.length === 0) {
      setDataListFilter(
        getDataListFilter(numberOfPastDays, numberOfFutureDays)
      );
    }

    const interval = setInterval(() => {
      const offset = getTimeIndicatorOffset();
      setTimeIndicatorOffset(offset);
    }, TV_GUIDE_CONSTANTS.TIME_INDICATOR_UPDATE_INTERVAL);

    return () => {
      clearInterval(interval);
      clearTimeout(timelineTimeOutRef);
      clearTimeout(programsTimeOutRef);
      clearTimeout(loadingTimeoutRef);
      clearTimeout(defaultFocusTimeoutRef);
      clearTimeout(timeout.current);
      lastScrollHorizontalOffset = null;
      lastScrollVerticalOffset = null;
    };
  }, []);

  const onScroll = (e) => {
    if (
      Math.floor(e.nativeEvent.contentOffset.x) >=
      Math.floor(timeIndicatorOffset + channelListWidth - timelineCellWidth)
    ) {
    } else {
    }
    if (
      e.nativeEvent.contentOffset.x + 1000 >=
      e.nativeEvent.contentSize.width
    ) {
      onHorizontallyEndReached();
    }
    if (
      e.nativeEvent.contentOffset.y + 1000 >=
      e.nativeEvent.contentSize.height
    ) {
      onVerticallyEndReached();
    }
  };
  const getWidth = () => {
    let calculatedWidth =
      (timelineData?.length ?? 1) * (timelineCellWidth + gridMargins) +
      channelListWidth +
      gridMargins;
    return calculatedWidth;
  };
  const onHorizontallyEndReached = () => {
    if (isFetching.current === true) return;
    isFetching.current = true;
  };
  const onVerticallyEndReached = () => {
    if (isFetchingVertically.current === true) return;
    isFetchingVertically.current = true;
  };
  const goToLive = () => {
    largeListRef.current.scrollTo(
      { y: 0, x: timeIndicatorOffset - channelListWidth },
      false
    );
  };
  const _renderHeader = () => {
    return (
      <View
        style={{
          height: timeLineHeaderHeight + gridMargins,
          flexDirection: "row",
          backgroundColor: containerBackroundColor,
          paddingBottom: gridMargins,
        }}
      >
        {!!renderLiveNowButton ? (
          renderLiveNowButton({ goToLive })
        ) : (
          <View style={{ width: channelListWidth }} />
        )}
        {timelineData.map((title, index) =>
          renderTimeLineItem({ item: title, index })
        )}
      </View>
    );
  };

  const _renderSection = (section) => {
    const channel = channelListState[section].channel;
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          flexDirection: "row",
          zIndex: 0,
        }}
      >
        {renderChannel({ item: channel, index: 0 })}
        <View
          style={{
            marginLeft: gridMargins,
            flexDirection: "row",
          }}
        >
          {timelineData.map((title, index) =>
            renderEpgItem({ item: title, index, channel, rowIndex: section })
          )}
        </View>
      </View>
    );
  };

  const _renderItem = (path) => {
    return <View />;
  };

  return (
    <View>
      <View style={containerStylesFlattten}>
        <View style={styles.tvGuideContainer}>
          {true && (
            <StickyForm
              style={{
                zIndex: 100,
                paddingTop: 0,
                marginTop: 0,
                paddingBottom:
                  Dimensions.get("screen").width / 1.77 -
                  (Dimensions.get("screen").width * 75) / 768,
              }}
              contentStyle={{
                alignItems: "flex-start",
                width: getWidth(),
              }}
              data={channelListState}
              ref={(ref) => (largeListRef.current = ref)}
              heightForSection={() => programLineHeight + gridMargins}
              renderHeader={_renderHeader}
              renderSection={_renderSection}
              heightForIndexPath={() => 0}
              renderIndexPath={_renderItem}
              bounces={false}
              initialContentOffset={{
                x: timeIndicatorOffset - channelListWidth * 1.5,
                y: 0,
              }}
              onScroll={onScroll}
            >
              {() => (
                <>
                  {
                    <View
                      style={{
                        left: timeIndicatorOffset + channelListWidth,
                        width: StyleSheet.hairlineWidth,
                        backgroundColor: "yellow",
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        zIndex: 10000,
                      }}
                    />
                  }
                </>
              )}
            </StickyForm>
          )}
        </View>
      </View>
    </View>
  );
}

TVGuideComponent.propTypes = {
  channeList: PropTypes.array.isRequired,
  programList: PropTypes.array.isRequired,
  onProgramSelectedChange: PropTypes.func.isRequired,
  tvGuideWidth: PropTypes.number.isRequired,
  tvGuideHeight: PropTypes.number.isRequired,
  sizePerPage: PropTypes.number.isRequired,
  timeLineHeaderHeight: PropTypes.number,
  numberOfChannelsDisplayed: PropTypes.number,
  numberOfTimelineCellDisplayed: PropTypes.number,
  channelListWidth: PropTypes.number,
  numberOfFutureDays: PropTypes.number,
  numberOfPastDays: PropTypes.number,
  containerBackroundColor: PropTypes.string,
};

TVGuideComponent.defaultProps = {
  programList: [],
  channeList: [],
  tvGuideWidth: TV_GUIDE_CONSTANTS.DEVICE_WIDTH,
  tvGuideHeight: TV_GUIDE_CONSTANTS.DEVICE_HEIGHT,
  timeLineHeaderHeight: TV_GUIDE_CONSTANTS.HEADER_CELL_HEIGHT,
  numberOfChannelsDisplayed: TV_GUIDE_CONSTANTS.NUMBER_OF_CHANNELS_DISPLAYED,
  numberOfTimelineCellDisplayed:
    TV_GUIDE_CONSTANTS.NUMBER_OF_TIMELINE_CELLS_DISPLAYED,
  channelListWidth: TV_GUIDE_CONSTANTS.CHANNEL_LIST_WIDTH,
  numberOfFutureDays: TV_GUIDE_CONSTANTS.NUMBER_OF_FUTURE_DAYS,
  numberOfPastDays: TV_GUIDE_CONSTANTS.NUMBER_OF_PAST_DAYS,
  containerBackroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.CONTAINER_BG_COLOR,
  sizePerPage: TV_GUIDE_CONSTANTS.SIZE_PER_PAGE,
};

export default React.memo(TVGuideComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.CONTAINER_BG_COLOR,
    height: TV_GUIDE_CONSTANTS.DEVICE_HEIGHT,
  },
  loadingContainer: {
    zIndex: 99,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 1,
  },
  timeIndicator: {
    position: "absolute",
    zIndex: 99,
    height: "100%",
    width: 5,
    borderRadius: 2,
    backgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.TIME_INDICATOR_BG_COLOR,
  },
  flexRow: {
    flexDirection: "row",
  },
  tvGuideContainer: {
    flex: 1,
  },
  footerLoadingContainer: {
    backgroundColor: "transparent",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
