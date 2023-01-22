import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import PropTypes from "prop-types";
import { TV_GUIDE_CONSTANTS } from "./constants";
import { generateTimelineData, userTimezoneDate } from "./util";
import { StickyForm } from "react-native-largelist";

var timelineTimeOutRef, programsTimeOutRef;
var currentDateDisplay = new Date();
var loadingTimeoutRef;
var defaultFocusTimeoutRef;
var lastScrollHorizontalOffset = null;
var lastScrollVerticalOffset = null;

function TVGuideComponent(props) {
  const {
    channeList = [],
    onChannelsEndReached,
    onProgramsEndReached,
    tvGuideWidth = Dimensions.get("screen").width,
    tvGuideHeight,
    timeLineHeaderHeight,
    channelListWidth,
    containerBackroundColor,
    programLineHeight,
    selectedProgramLineHeight,
    activeChannelIndex,
    renderChannel,
    renderEpgItem,
    renderTimeLineItem,
    renderLiveNowButton,
    renderCurrentTimeView,
    timelineCellWidth,
    style,
    contentContainerStyle,
    gridMargins,
    renderLiveIndicator,
    didLoadAllEpgs,
    didLoadAllChannels,
    onScroll,
    verticalScrollPosition,
    horizontalScrollPosition,
    snapToInterval,
    onGoToLive,
    scrollEnabled = true,
    onScrollBeginDrag,
    bounces = false,
    onScrollToTop,
  } = props;

  const largeListRef = useRef(null);
  const liveIndicatorRef = useRef(null);
  const currentTimeViewRef = useRef(null);
  const isFetchingVertically = useRef(null);
  const isFetching = useRef(null);
  const didScrollToInitialOffset = useRef(false);

  const [timeIndicatorOffset, setTimeIndicatorOffset] = useState(null);
  const [timelineData, setTimelineData] = useState(
    generateTimelineData(currentDateDisplay)
  );

  const containerStylesFlattten = useMemo(
    () =>
      StyleSheet.flatten([
        styles.container,
        {
          width: Dimensions.get("screen").width,
          height: tvGuideHeight,
          backgroundColor: containerBackroundColor,
        },
        style,
      ]),
    [tvGuideWidth, tvGuideHeight, containerBackroundColor]
  );

  const getYAxisPosition = useMemo(() => {
    return activeChannelIndex > -1
      ? activeChannelIndex * (programLineHeight + gridMargins)
      : 0;
  }, [activeChannelIndex]);

  const getTimeIndicatorOffset = useCallback(() => {
    if (timelineData.length === 0) return 0;
    const now = new Date();
    const diff =
      Math.abs(now.getTime() - timelineData[0].start) /
      TV_GUIDE_CONSTANTS.HALF_HOUR_DURATION;
    const offset =
      (diff > 48 ? diff - 48 : diff) * (timelineCellWidth + gridMargins) +
      channelListWidth;
    return offset;
  }, [timelineData]);

  useEffect(() => {
    if (!scrollEnabled && lastScrollVerticalOffset < 0)
      largeListRef.current?.scrollTo(
        { x: lastScrollHorizontalOffset, y: 0 },
        true
      );
  }, [scrollEnabled]);

  useEffect(() => {
    if (timelineData.length > 0 && !timeIndicatorOffset) {
      setTimeIndicatorOffset(getTimeIndicatorOffset());
    }
  }, [timelineData]);

  useEffect(() => {
    onScrollToTop && onScrollToTop(scrollToTop);
  }, [channeList, channeList?.length, largeListRef]);

  useEffect(() => {
    onGoToLive && onGoToLive(goToLive);
    onScrollToTop && onScrollToTop(scrollToTop);
  }, [timeIndicatorOffset, activeChannelIndex]);

  useEffect(() => {
    let interval = null;
    const timeout = setTimeout(() => {
      const offset = getTimeIndicatorOffset();
      setTimeIndicatorOffset(offset);
      interval = setInterval(() => {
        const offset = getTimeIndicatorOffset();
        setTimeIndicatorOffset(offset);
      }, TV_GUIDE_CONSTANTS.TIME_INDICATOR_UPDATE_INTERVAL);
    }, (60 - new Date().getSeconds()) * 1000);

    return () => {
      timeout && clearTimeout(timeout);
      interval && clearInterval(interval);
      clearTimeout(timelineTimeOutRef);
      clearTimeout(programsTimeOutRef);
      clearTimeout(loadingTimeoutRef);
      clearTimeout(defaultFocusTimeoutRef);
      clearTimeout(timeout.current);
      lastScrollHorizontalOffset = null;
      lastScrollVerticalOffset = null;
    };
  }, []);

  const _onScroll = (e) => {
    const {
      nativeEvent: {
        contentOffset: { x, y },
        contentSize: { width, height },
      },
    } = e;
    onScroll && onScroll(e);
    const threshold = timeIndicatorOffset - (channelListWidth + gridMargins);
    liveIndicatorRef.current &&
      liveIndicatorRef.current.updateIndicatorOffset(e, threshold);
    currentTimeViewRef.current &&
      currentTimeViewRef.current.updateIndicatorOffset(e, threshold);
    if (
      x &&
      lastScrollHorizontalOffset &&
      lastScrollHorizontalOffset !== x &&
      x + timelineCellWidth * 6 >= width
    ) {
      onHorizontallyEndReached();
    }
    if (
      y &&
      lastScrollVerticalOffset &&
      lastScrollVerticalOffset !== y &&
      y + 1000 + (contentContainerStyle?.paddingBottom ?? 0) >= height
    ) {
      onVerticallyEndReached();
    }
    lastScrollVerticalOffset = y;
    lastScrollHorizontalOffset = x;
  };

  const getWidth = () => {
    let calculatedWidth =
      (timelineData?.length ?? 1) * (timelineCellWidth + gridMargins) +
      channelListWidth +
      gridMargins;
    return calculatedWidth;
  };

  const onHorizontallyEndReached = () => {
    if (didLoadAllEpgs) return;
    isFetching.current = true;
    onProgramsEndReached && onProgramsEndReached();
  };

  const onVerticallyEndReached = () => {
    if (didLoadAllChannels) return;
    isFetchingVertically.current = true;
    onChannelsEndReached && onChannelsEndReached();
  };

  const goToLive = () => {
    largeListRef.current.scrollTo(
      {
        y: getYAxisPosition,
        x:
          timeIndicatorOffset < timelineCellWidth
            ? 0
            : getWidth() -
                (timelineCellWidth + gridMargins) * 3 -
                channelListWidth <=
              timeIndicatorOffset - channelListWidth - timelineCellWidth / 2
            ? getWidth() - Dimensions.get("screen").width - channelListWidth
            : timeIndicatorOffset - channelListWidth - timelineCellWidth / 2,
      },
      false
    );
  };

  const scrollToTop = () => {
    largeListRef.current.scrollTo(
      {
        y: 0,
        x:
          timeIndicatorOffset < timelineCellWidth
            ? 0
            : getWidth() -
                (timelineCellWidth + gridMargins) * 3 -
                channelListWidth <=
              timeIndicatorOffset - channelListWidth - timelineCellWidth / 2
            ? getWidth() - Dimensions.get("screen").width - channelListWidth
            : timeIndicatorOffset - channelListWidth - timelineCellWidth / 2,
      },
      false
    );
  };

  const onLiveIndicatorRef = (ref) => {
    liveIndicatorRef.current = ref;
  };

  const onCurrentTimeViewRef = (ref) => {
    currentTimeViewRef.current = ref;
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
        {!!renderCurrentTimeView && channeList.length > 0
          ? renderCurrentTimeView({
              offset: timeIndicatorOffset,
              onRef: onCurrentTimeViewRef,
            })
          : null}
        {timelineData.map((title, index) =>
          renderTimeLineItem({ item: title, index })
        )}
      </View>
    );
  };

  const _renderSection = (section, scrollX) => {
    const channel = channeList[section];
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
        }}
        key={section + "-" + channel.channel.id}
      >
        {renderChannel({ item: channel.channel, index: section })}
        <View
          style={{
            flexDirection: "row",
          }}
          key={section + "-" + channel.channel.id}
        >
          {channel.items.map((item, index) =>
            renderEpgItem({
              item,
              index,
              channel: channel.channel,
              rowIndex: section,
              scrollX: horizontalScrollPosition,
            })
          )}
        </View>
      </View>
    );
  };

  const _renderItem = (path) => {
    return <View />;
  };

  const _onLayout = () => {
    if (didScrollToInitialOffset.current == true) return;
    didScrollToInitialOffset.current = true;
  };

  return (
    <View style={[containerStylesFlattten, {}]}>
      <StickyForm
        onLayout={_onLayout}
        scrollsToTop={false}
        scrollEnabled={scrollEnabled}
        decelerationRate={0.05}
        snapToOffsets={
          snapToInterval
            ? [...timelineData.map((x, i) => i * snapToInterval)]
            : null
        }
        snapToAlignment="start"
        contentStyle={{
          alignItems: "flex-start",
          width: getWidth(),
          ...contentContainerStyle,
        }}
        data={channeList}
        ref={(ref) => (largeListRef.current = ref)}
        heightForSection={(section) =>
          section === activeChannelIndex
            ? selectedProgramLineHeight + gridMargins
            : programLineHeight + gridMargins
        }
        renderHeader={_renderHeader}
        renderSection={_renderSection}
        heightForIndexPath={() => 0}
        renderIndexPath={_renderItem}
        bounces={bounces}
        initialContentOffset={{
          x: timeIndicatorOffset - channelListWidth - timelineCellWidth / 2,
          y: getYAxisPosition,
        }}
        onNativeContentOffsetExtract={{
          x: horizontalScrollPosition,
          y: verticalScrollPosition,
        }}
        directionalLockEnabled={true}
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onScroll={_onScroll}
        groupCount={9}
        groupMinHeight={tvGuideHeight}
        allLoaded
        onScrollBeginDrag={onScrollBeginDrag}
      >
        {() => (
          <>
            {renderLiveIndicator
              ? channeList.length
                ? renderLiveIndicator({
                    offset: timeIndicatorOffset,
                    onRef: onLiveIndicatorRef,
                  })
                : null
              : null}
          </>
        )}
      </StickyForm>
    </View>
  );
}

TVGuideComponent.propTypes = {
  channeList: PropTypes.array,
  tvGuideWidth: PropTypes.number,
  tvGuideHeight: PropTypes.number,
  sizePerPage: PropTypes.number,
  timeLineHeaderHeight: PropTypes.number,
  numberOfChannelsDisplayed: PropTypes.number,
  numberOfTimelineCellDisplayed: PropTypes.number,
  channelListWidth: PropTypes.number,
  containerBackroundColor: PropTypes.string,
};

TVGuideComponent.defaultProps = {
  programList: [],
  channeList: [],
  tvGuideWidth: Dimensions.get("screen").width,
  tvGuideHeight: Dimensions.get("screen").height,
  timeLineHeaderHeight: TV_GUIDE_CONSTANTS.HEADER_CELL_HEIGHT,
  numberOfChannelsDisplayed: TV_GUIDE_CONSTANTS.NUMBER_OF_CHANNELS_DISPLAYED,
  numberOfTimelineCellDisplayed:
    TV_GUIDE_CONSTANTS.NUMBER_OF_TIMELINE_CELLS_DISPLAYED,
  channelListWidth: TV_GUIDE_CONSTANTS.CHANNEL_LIST_WIDTH,
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
