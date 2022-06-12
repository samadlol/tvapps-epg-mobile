import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TV_GUIDE_CONSTANTS } from '../../constants';
import { formatHourMin, caculateDurationProgram } from '../../util';
import PropTypes from 'prop-types';
import ProgramImagePreview from './programImagePreview';

const checkShowProgramContent = (program) => {
    const programDuration = program?.endDateAdjusted - program?.startDateAdjusted;
    if (programDuration >= TV_GUIDE_CONSTANTS.PROGRAM_MIN_DURATION_SHOW_CONTENT) return true;
    return false;
};

const checkShowProgramImagePreview = (program) => {
    const programDuration = program?.endDateAdjusted - program?.startDateAdjusted;
    if (programDuration >= TV_GUIDE_CONSTANTS.PROGRAM_MIN_DURATION_SHOW_IMAGE_PREV) return true;
    return false;
};

const getProgramTimeType = (program) => {
    const now = new Date().getTime();
    if (program.startDateAdjusted <= now && program.endDateAdjusted > now) {
        return TV_GUIDE_CONSTANTS.PROGRAM_TIME_TYPE.CURRENT;
    } else if (program.endDateAdjusted <= now) {
        return TV_GUIDE_CONSTANTS.PROGRAM_TIME_TYPE.PAST;
    }
    return TV_GUIDE_CONSTANTS.PROGRAM_TIME_TYPE.FUTURE;
};

const processSeiresNameText = (programSeriesName) => {
    if (!programSeriesName) return null;
    if (programSeriesName && programSeriesName.length > 12) {
        return `${programSeriesName.substring(0, 12)}...`;
    }
    return programSeriesName;
};
function ProgramCell(props) {
    const {
        lineIndex,
        index,
        program,
        programHeight,
        onProgramSelectedChange,
        timelineCellWidth,
        isLastProgram,
        renderDoneLineProgram
    } = props;

    const programWidth = ((Number((program?.endDateAdjusted - program?.startDateAdjusted) / TV_GUIDE_CONSTANTS.HALF_HOUR_DURATION) * timelineCellWidth)) - TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_LINE_MARGIN_RIGHT;
    const isCurrentProgram = getProgramTimeType(program);
    const isShowProgramContent = checkShowProgramContent(program);
    const isShowProgramImagePreview = checkShowProgramImagePreview(program);
    const programContainerStylesFlatten = StyleSheet.flatten([styles.programContainer, props.programContainerStyles]);
    const currentProgramStylesFlatten = StyleSheet.flatten([styles.nowProgram, { backgroundColor: props.programStylesColors.currentProgramBacgroundColor }]);
    const pastProgramStylesFlatten = StyleSheet.flatten([styles.defaultProgram, { backgroundColor: props.programStylesColors.pastProgramBackgroundColor }]);
    const futureProgramStylesFlatten = StyleSheet.flatten([styles.defaultProgram, { backgroundColor: props.programStylesColors.futureProgramBackgroundColor }]);
    const currentProgramTextStylesFlatten = StyleSheet.flatten([styles.title, { color: props.programStylesColors.currrentProgramTextColor, fontSize: props.programStylesColors.programNameFontSize }]);
    const pastProgramTextStylesFlatten = StyleSheet.flatten([styles.titlePast, { color: props.programStylesColors.pastProgramTextColor, opacity: 0.4, fontSize: props.programStylesColors.programNameFontSize }]);
    const futureProgramTextStylesFlatten = StyleSheet.flatten([styles.title, { color: props.programStylesColors.futureProgramTextColor, fontSize: props.programStylesColors.programNameFontSize }]);
    const programStartTimeFaltten = StyleSheet.flatten([styles.programStartTime, { color: props.programStylesColors.startDateProgramTextColor, fontSize: props.programStylesColors.startDateProgramTextFontSize, backgroundColor: props.programStylesColors.startDateProgramBackgroundColor }]);

    const programDuration = caculateDurationProgram(program?.startDateAdjusted, program?.endDateAdjusted);

    const onProgramChange = useCallback(() => {
        // console.log('program cell onProgramChange ', index, lineIndex, program)
        onProgramSelectedChange({ index, lineIndex, program })
    }, []);


    // useEffect(() => {
    //     if (isLastProgram) {
    //         renderDoneLineProgram(lineIndex);
    //     }
    // }, []);

    let programStylesFlatten = styles.defaultProgram;
    let programTextStylesFlattent = styles.title;
    if (isCurrentProgram === TV_GUIDE_CONSTANTS.PROGRAM_TIME_TYPE.CURRENT) {
        programStylesFlatten = currentProgramStylesFlatten;
        programTextStylesFlattent = currentProgramTextStylesFlatten;
    } else if (isCurrentProgram === TV_GUIDE_CONSTANTS.PROGRAM_TIME_TYPE.FUTURE) {
        programStylesFlatten = futureProgramStylesFlatten;
        programTextStylesFlattent = futureProgramTextStylesFlatten;
    } else {
        programStylesFlatten = pastProgramStylesFlatten;
        programTextStylesFlattent = pastProgramTextStylesFlatten;
    }

    // console.log('render program lineIndex index', lineIndex, index);

    return (
        <TouchableOpacity
            style={[
                programContainerStylesFlatten,
                programStylesFlatten,
                { width: programWidth, height: programHeight },
            ]}
            onPress={onProgramChange}
        >
            {isShowProgramContent && (
                <View style={styles.progarmContainer}>
                    {isShowProgramImagePreview && <ProgramImagePreview imageHeight={programHeight} source={program?.imageSrc} />}
                    <View style={styles.containerBox}>
                        <View style={[styles.wrapDetailBox]}>
                            <Text style={programStartTimeFaltten}>{formatHourMin(program?.startDateAdjusted)}</Text>
                            <Text style={styles.programSeiresNameText} numberOfLines={1} ellipsizeMode='tail' >{processSeiresNameText(program?.seriesName)}</Text>
                            <Text style={styles.programDurationText}>{programDuration}</Text>
                        </View>
                        <View style={styles.wrapTitleBox}>
                            <Text
                                style={programTextStylesFlattent} numberOfLines={1}
                            >
                                {program && program.name ? `${program?.name}` : ''}
                            </Text>
                            {/* <Text style={styles.p}>{new Date(program?.startDate)}</Text> */}
                        </View>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}

ProgramCell.propTypes = {
    program: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        shortName: PropTypes.string,
        serisName: PropTypes.string,
        description: PropTypes.string,
        prName: PropTypes.string,
        startDate: PropTypes.any,
        endDate: PropTypes.any,
        startDateAdjusted: PropTypes.any,
        endDateAdjusted: PropTypes.any,
        referanceProgramId: PropTypes.string,
        flags: PropTypes.number,
        seriesSeasion: PropTypes.string,
        responseElementType: PropTypes.string,
        price: PropTypes.number,
        imageSrc: PropTypes.string,
        genres: PropTypes.array,
        prLevel: PropTypes.number,
    }).isRequired,
    index: PropTypes.number.isRequired,
    lineIndex: PropTypes.number.isRequired,
    onProgramSelectedChange: PropTypes.func.isRequired,
    programStylesColors: PropTypes.object,
    programContainerStyles: PropTypes.object,

};

ProgramCell.defaultProps = {
    program: { name: '', id: -1 },
    index: 0,
    lineIndex: 0,
    onProgramSelectedChange: () => { },
    programStylesColors: {
        activeProgramBackgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.ACTIVE_PROGRAM_BG_COLOR,
        currentProgramBacgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.CURRENT_PROGRAM_BG_COLOR,
        pastProgramBackgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.DEFAULT_PROGRAM_BG_COLOR,
        futureProgramBackgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.FUTURE_PROGRAM_BG_COLOR,
        activeProgramTextColor: TV_GUIDE_CONSTANTS.THEME_STYLES.FUTURE_PROGRAM_TEXT_COLOR,
        currrentProgramTextColor: TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_TEXT_COLOR,
        pastProgramTextColor: TV_GUIDE_CONSTANTS.THEME_STYLES.FUTURE_PROGRAM_TEXT_COLOR,
        futureProgramTextColor: TV_GUIDE_CONSTANTS.THEME_STYLES.FUTURE_PROGRAM_TEXT_COLOR,
        startDateProgramBackgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_TIME_START_BG_COLOR,
        startDateProgramTextColor: TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_TIME_START_TEXT_COLOR,
        startDateProgramTextFontSize: TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_START_DATE_FONT_SIZE,
        programNameFontSize: TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_TITLE_FONT_SIZE
    },
    programContainerStyles: {

    }
};

export default React.memo(ProgramCell);

const styles = StyleSheet.create({
    activeProgram: {
        backgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.ACTIVE_PROGRAM_BG_COLOR,
        marginRight: TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_LINE_MARGIN_RIGHT,
        justifyContent: 'center',
    },
    defaultProgram: {
        backgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.DEFAULT_PROGRAM_BG_COLOR,
        flexDirection: 'column',
    },
    nowProgram: {
        backgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.CURRENT_PROGRAM_BG_COLOR,
    },
    programContainer: {
        color: '#ffff',
        marginRight: TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_LINE_MARGIN_RIGHT,
    },
    title: {
        color: TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_TEXT_COLOR,
        fontSize: TV_GUIDE_CONSTANTS.THEME_STYLES.TIME_LINE_TITLE_FONT_SIZE,
    },
    titleActive: {
        color: TV_GUIDE_CONSTANTS.THEME_STYLES.FUTURE_PROGRAM_TEXT_COLOR,
        fontSize: TV_GUIDE_CONSTANTS.THEME_STYLES.TIME_LINE_TITLE_FONT_SIZE,
    },
    titlePast: {
        color: TV_GUIDE_CONSTANTS.THEME_STYLES.PAST_PROGRAM_TEXT_COLOR,
        fontSize: TV_GUIDE_CONSTANTS.THEME_STYLES.TIME_LINE_TITLE_FONT_SIZE,
    },
    programStartTime: {
        paddingHorizontal: 2,
        backgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_TIME_START_BG_COLOR,
        borderRadius: 1,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    containerBox: {
        flex: 1,
    },
    wrapDetailBox: {
        height: 24,
        flexDirection: 'row',
        alignContent: 'center',
        padding: 2
    },
    wrapTitleBox: {
        marginTop: 6,
        paddingStart: 2
    },
    programSeiresNameText: {
        color: 'white',
        marginLeft: 2,

    },
    programDurationText: {
        color: 'white',
        marginLeft: 4
    },
    progarmContainer: {
        flexDirection: 'row',
    },
    p: {
        color: 'red',
        fontSize: 8
    }

});
