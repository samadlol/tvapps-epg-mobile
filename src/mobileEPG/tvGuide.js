import React, { useState, useEffect, useCallback, useRef, useMemo, } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    FlatList,
    ActivityIndicator
} from 'react-native';
import PropTypes from 'prop-types';
import { ProgramLine, ChannelItem, HeaderTimeCell, HeaderFilter, LoadingIndicator } from './components';
import { TV_GUIDE_CONSTANTS } from './constants';
import {
    generateTimelineData,
    compareTwoDates,
    getDataListFilter,
} from './util';

const today = new Date();

var timelineTimeOutRef, programsTimeOutRef;
var currentDateDisplay = new Date();
var timelineData = [];
var loadingTimeoutRef;
var defaultFocusTimeoutRef;
var lastScrollHorizontalOffset = null;
var lastScrollVerticalOffset = null;

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
        isLastPageOffset
    } = props;

    const timelineHeaderRef = useRef(null);
    const horizontalScrollRef = useRef(null);
    const channelListRef = useRef(null);
    const programListRef = useRef(null);
    const [timeIndicatorOffset, setTimeIndicatorOffset] = useState(null);
    const visibleTimeIndicator = compareTwoDates(currentDate, today);
    const [visibleLoadingIndicator, setVisibleLoadingIndicator] = useState(true);
    const timeIndicatorStylesFlatten = useMemo(() => StyleSheet.flatten([styles.timeIndicator, timeIndicatorStyles]), [timeIndicatorStyles]);
    const containerStylesFlattten = useMemo(() => StyleSheet.flatten([styles.container, { width: tvGuideWidth, height: tvGuideHeight, backgroundColor: containerBackroundColor }]), [tvGuideWidth, tvGuideHeight, containerBackroundColor]);
    const timelineCellWidth = (tvGuideWidth - channelListWidth) / numberOfTimelineCellDisplayed;
    const programListContainerWidth = tvGuideWidth - channelListWidth;
    const timeLineIndicatorHeight = tvGuideHeight + timeLineHeaderHeight;
    const programLineHeightLayoutItem = programLineHeight + TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_LINE_MARGIN_BOTTOM;
    const paddingBottomContaner = numberOfChannelsDisplayed * TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_LINE_MARGIN_BOTTOM;
    const [programListIsScrolling, setProgramListIsScrolling] = useState(false);
    const [channelListState, setChannelListState] = useState([]);
    const [programListState, setProgramListState] = useState([]);
    const [dateFilterSelected, setDateFilterSelected] = useState(currentDate);
    const [dataListFilter, setDataListFilter] = useState([]);

    const scrollHorizontal = useCallback(offsetX => {
        try {
            timelineTimeOutRef = setTimeout(() => {
                timelineHeaderRef.current?.scrollToOffset({ animated: false, offset: offsetX });
            }, 10);

            programsTimeOutRef = setTimeout(() => {
                horizontalScrollRef.current?.scrollTo({ x: offsetX, y: 0, animated: false });
            }, 20);
        } catch (error) {
            return error;
        }
    }, []);

    const scrollVertical = useCallback((offsetY) => {
        try {
            channelListRef.current.scrollToOffset({
                animated: true,
                offset: offsetY,
            });
            programListRef.current.scrollToOffset({
                animated: true,
                offset: offsetY,
            });
        } catch (e) {
            return e;
        }
    }, []);

    const getTimeIndicatorOffset = useCallback(() => {
        if (timelineData.length === 0) return 0;
        const now = new Date();
        return Math.abs(now.getTime() - timelineData[0].start) / TV_GUIDE_CONSTANTS.HALF_HOUR_DURATION * timelineCellWidth;
    }, []);

    const onProgramSelectedChangeCallBack = ({ index, lineIndex, program }) => {
        onProgramSelectedChange({ program })
    }

    useEffect(() => {
        setChannelListState([...channeList]);
    }, [channeList])

    useEffect(() => {
        setProgramListState([...programList]);
    }, [programList]);

    useEffect(() => {
        if (programListState.length > 0 && lastScrollHorizontalOffset == null) {
            const offsetTimeline = getTimeIndicatorOffset();
            const detalOffset = numberOfTimelineCellDisplayed * timelineCellWidth / numberOfTimelineCellDisplayed;
            scrollHorizontal(Math.abs(offsetTimeline - detalOffset));
        }
        setVisibleLoadingIndicator(false);
    }, [programListState])

    useEffect(() => {
        currentDateDisplay = new Date(currentDate);
        timelineData = [...generateTimelineData(currentDateDisplay)];
        if (visibleTimeIndicator) {
            setTimeIndicatorOffset(getTimeIndicatorOffset());
        }
        scrollVertical(0);
    }, [currentDate]);

    const onProgramListScrollHandle = (event) => {
        if (!programListIsScrolling) {
            const scrollableCoord = event.nativeEvent.contentOffset.y;
            lastScrollVerticalOffset = scrollableCoord;
            channelListRef?.current?.scrollToOffset({ offset: scrollableCoord, animated: false });
        }
        setProgramListIsScrolling(false);
    };

    const onScrollHorizontalHandle = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        lastScrollHorizontalOffset = offsetX;
        timelineHeaderRef?.current?.scrollToOffset({ offset: offsetX, animated: false });
    };

    const onEndReachedProgramsList = () => {
        if (isLastPageOffset === true) return;
        onReachingEndChannel();
    };

    const onDateFilterChanged = useCallback((date) => {
        lastScrollVerticalOffset = null;
        setVisibleLoadingIndicator(true);
        setDateFilterSelected(date);
        onDateChange(date);
        setProgramListState([]);
        setChannelListState([]);
    }, []);

    useEffect(() => {
        timelineData = [...generateTimelineData(currentDateDisplay)];
        if (timelineData.length > 0 && timeIndicatorOffset === null) {
            setTimeIndicatorOffset(getTimeIndicatorOffset());
        }

        if (dataListFilter && dataListFilter.length === 0) {
            setDataListFilter(getDataListFilter(numberOfPastDays, numberOfFutureDays));
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
            lastScrollHorizontalOffset = null;
            lastScrollVerticalOffset = null;
        };
    }, []);

    const renderChannelItem = useCallback(({ item, index }) => {
        return (
            <ChannelItem
                channel={item}
                tvGuideHeight={tvGuideHeight}
                timeLineHeaderHeight={timeLineHeaderHeight}
                numberOfChannelsDisplayed={numberOfChannelsDisplayed}
                channelHeight={programLineHeight}
                index={index}
            />
        );
    }, []);

    const renderTimeLineItem = useCallback(
        ({ item }) => <HeaderTimeCell time={item}
            numberOfTimelineCellDisplayed={numberOfTimelineCellDisplayed}
            timeLineItemWidth={timelineCellWidth}
        />,
        [],
    );

    const getTimeLineKeyExtractor = useCallback(
        (item, index) => `${item.start}-${index}`,
        [],
    );

    const renderProgramLine = useCallback(({ item, index }) => {
        const { channelExternalId, programs } = item;
        return (
            <ProgramLine
                currentDate={currentDate}
                onProgramSelectedChange={onProgramSelectedChangeCallBack}
                lineIndex={index}
                programs={programs}
                channelExternalId={channelExternalId}
                programStylesColors={programStylesColors}
                programContainerStyles={programContainerStyles}
                tvGuideWidth={tvGuideWidth}
                tvGuideHeight={tvGuideHeight}
                programLineHeight={programLineHeight}
                timeLineHeaderHeight={timeLineHeaderHeight}
                numberOfChannelsDisplayed={numberOfChannelsDisplayed}
                channelListWidth={channelListWidth}
                numberOfTimelineCellDisplayed={numberOfTimelineCellDisplayed}
                timelineCellWidth={timelineCellWidth}
            />
        );
    }, [programListState,]);

    const getProgramLineKeyExtractor = useCallback((item, index) => `${item.channelExternalId}${index}`, []);

    const getChannelsKeyExtractor = useCallback((item, index) => `${item.channelExternalId}${index}`, []);

    const getChannelsLayout = useCallback((data, index) => ({ length: programLineHeightLayoutItem, offset: programLineHeightLayoutItem * index, index }), []);

    const getProgramsLayout = useCallback((data, index) => ({ length: programLineHeightLayoutItem, offset: programLineHeightLayoutItem * index, index }), []);

    const getTimelinesLayout = useCallback(
        (data, index) => ({
            length: timelineCellWidth + TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_LINE_MARGIN_RIGHT,
            offset: (timelineCellWidth + TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_LINE_MARGIN_RIGHT) * index,
            index,
        }),
        [],
    );

    const renderHeaderFilter = useMemo(() => (
        <HeaderFilter data={dataListFilter} dateSelected={dateFilterSelected} onDateFilterChanged={onDateFilterChanged} />
    ), [dateFilterSelected, dataListFilter]);

    const listProgramFooterComponent = () => {
        if (isLastPageOffset) return null;
        return (
            <View style={[styles.footerLoadingContainer, { width: '100%' }]}>
                <ActivityIndicator size="large" color={TV_GUIDE_CONSTANTS.THEME_STYLES.ACTIVE_PROGRAM_BG_COLOR} />
            </View>
        )
    }

    return (
        <View>
            {visibleLoadingIndicator && <View style={styles.loadingContainer}>
                <LoadingIndicator />
            </View>}
            <View style={containerStylesFlattten}>
                <View style={styles.tvGuideContainer}>
                    {renderHeaderFilter}
                    <View style={styles.flexRow}>
                        <View style={{
                            width: channelListWidth,
                            height: timeLineHeaderHeight,
                        }} />

                        <FlatList
                            horizontal
                            removeClippedSubviews
                            legacyImplementation
                            ref={timelineHeaderRef}
                            scrollEnabled={false}
                            showsHorizontalScrollIndicator={false}
                            data={timelineData}
                            renderItem={renderTimeLineItem}
                            keyExtractor={getTimeLineKeyExtractor}
                            getItemLayout={getTimelinesLayout}
                        />
                    </View>

                    {<View style={styles.flexRow}>
                        <FlatList
                            removeClippedSubviews
                            legacyImplementation
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={numberOfChannelsDisplayed}
                            maxToRenderPerBatch={TV_GUIDE_CONSTANTS.FLAT_LIST_CONFIG.MAX_RENDER_PER_BATCH}
                            windowSize={TV_GUIDE_CONSTANTS.FLAT_LIST_CONFIG.WINDOW_SIZE}
                            ref={channelListRef}
                            data={channelListState}
                            renderItem={renderChannelItem}
                            keyExtractor={getChannelsKeyExtractor}
                            contentContainerStyle={{ paddingBottom: paddingBottomContaner, marginEnd: 8, }}
                            scrollEventThrottle={TV_GUIDE_CONSTANTS.FLAT_LIST_CONFIG.SCROLL_EVENT_THROTTLE}
                            getItemLayout={getChannelsLayout}
                            ListFooterComponent={listProgramFooterComponent}
                        />
                        <View style={{ width: programListContainerWidth }}>
                            <ScrollView
                                horizontal
                                ref={horizontalScrollRef}
                                nestedScrollEnabled={false}
                                scrollEventThrottle={TV_GUIDE_CONSTANTS.FLAT_LIST_CONFIG.SCROLL_EVENT_THROTTLE}
                                onScroll={onScrollHorizontalHandle}
                            >
                                <FlatList
                                    legacyImplementation
                                    removeClippedSubviews
                                    ref={programListRef}
                                    initialNumToRender={numberOfChannelsDisplayed}
                                    maxToRenderPerBatch={TV_GUIDE_CONSTANTS.FLAT_LIST_CONFIG.MAX_RENDER_PER_BATCH}
                                    data={programListState}
                                    renderItem={renderProgramLine}
                                    keyExtractor={getProgramLineKeyExtractor}
                                    onEndReached={onEndReachedProgramsList}
                                    onEndReachedThreshold={TV_GUIDE_CONSTANTS.FLAT_LIST_CONFIG.ON_END_REACHED_THRESHOLD}
                                    contentContainerStyle={{ paddingBottom: paddingBottomContaner, }}
                                    scrollEventThrottle={TV_GUIDE_CONSTANTS.FLAT_LIST_CONFIG.SCROLL_EVENT_THROTTLE}
                                    getItemLayout={getProgramsLayout}
                                    onScroll={onProgramListScrollHandle}
                                    ListFooterComponent={listProgramFooterComponent}
                                />
                                {timeIndicatorOffset && visibleTimeIndicator && <View style={[timeIndicatorStylesFlatten, { left: timeIndicatorOffset, height: timeLineIndicatorHeight }]} />}
                            </ScrollView>
                        </View>
                    </View>
                    }
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
    numberOfTimelineCellDisplayed: TV_GUIDE_CONSTANTS.NUMBER_OF_TIMELINE_CELLS_DISPLAYED,
    channelListWidth: TV_GUIDE_CONSTANTS.CHANNEL_LIST_WIDTH,
    numberOfFutureDays: TV_GUIDE_CONSTANTS.NUMBER_OF_FUTURE_DAYS,
    numberOfPastDays: TV_GUIDE_CONSTANTS.NUMBER_OF_PAST_DAYS,
    containerBackroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.CONTAINER_BG_COLOR,
    sizePerPage: TV_GUIDE_CONSTANTS.SIZE_PER_PAGE
};

export default React.memo(TVGuideComponent);

const styles = StyleSheet.create({
    container: {
        backgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.CONTAINER_BG_COLOR,
        height: TV_GUIDE_CONSTANTS.DEVICE_HEIGHT
    },
    loadingContainer: {
        zIndex: 99,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        opacity: 1,
    },
    timeIndicator: {
        position: 'absolute',
        zIndex: 99,
        height: '100%',
        width: 5,
        borderRadius: 2,
        backgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.TIME_INDICATOR_BG_COLOR
    },
    flexRow: {
        flexDirection: 'row',
    },
    tvGuideContainer: {
        flex: 1,
    },
    footerLoadingContainer: {
        backgroundColor: 'transparent',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
