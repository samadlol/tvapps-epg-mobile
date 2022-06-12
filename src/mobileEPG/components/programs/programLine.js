import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import ProgramCell from './programCell';
import PropTypes from 'prop-types';
import { TV_GUIDE_CONSTANTS } from '../../constants';
import { getStartDayTimestamp } from '../../util';


class ProgramLine extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.lineIndex !== this.props.lineIndex) return true;
        if (nextProps.channelExternalId !== this.props.channelExternalId) return true;
        return false;
    }

    renderItemProgram = (item, index, programs) => {
        const { lineIndex, onProgramSelectedChange, programStylesColors, programContainerStyles, timelineCellWidth, programLineHeight, } = this.props;
        const isLastProgram = index === programs.length - 1;
        // console.log('renderItemProgram: ', lineIndex, index);
        return (
            <ProgramCell
                onProgramSelectedChange={onProgramSelectedChange}
                program={item}
                index={index}
                lineIndex={lineIndex}
                programStylesColors={programStylesColors}
                programContainerStyles={programContainerStyles}
                programHeight={programLineHeight}
                timelineCellWidth={timelineCellWidth}
                isLastProgram={isLastProgram}
            />
        );
    };

    renderProgramsLine = () => {
        const { programs, lineIndex, currentDate } = this.props;
        const keyTime = currentDate.getTime();
        return programs.map((item, index) => (
            <View key={`${lineIndex}${index}${keyTime}`}>
                {this.renderItemProgram(item, lineIndex, programs)}
            </View>
        ));
    };

    render() {
        const { programLineHeight, } = this.props;
        return (
            <View style={[styles.programLineContainer, { height: programLineHeight }]}>
                <View style={styles.flexRow}>
                    {this.renderProgramsLine()}
                </View>
            </View>
        );
    }
}

ProgramLine.propTypes = {
    programs: PropTypes.array.isRequired,
    lineIndex: PropTypes.number.isRequired,
    onProgramSelectedChange: PropTypes.func.isRequired,
    renderDoneChannelPrograms: PropTypes.func.isRequired,
};

ProgramLine.defaultProps = {
    lineIndex: 0,
    onProgramSelectedChange: () => { },
    setFocus: () => { },
    renderDoneChannelPrograms: () => { },
    programs: [],
    currentDate: new Date(),
};


const styles = StyleSheet.create({
    programLineContainer: {
        marginBottom: TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_LINE_MARGIN_BOTTOM
    },
    flexRow: {
        flexDirection: 'row',
    }
});

export default ProgramLine;


