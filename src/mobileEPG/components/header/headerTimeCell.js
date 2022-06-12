import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TV_GUIDE_CONSTANTS } from '../../constants';
import { getSuffixHour } from '../../util';
import Styles from '../../styles';

export default class HeaderTimeCell extends React.Component {

    constructor(props) {
        super(props);
    }

    static defaultProps = {
        time: {},
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.time.start !== this.props.time.start) return true;
        return false;
    }

    render() {

        const { time, timeLineItemWidth } = this.props;
        const { text } = time || '';
        const styles = hourStyle;

        return (
            <View style={[styles.conntainer, { width: timeLineItemWidth }]}>
                <Text style={styles.content}>{`${text}`}</Text>
            </View>
        );
    }
}

const hourStyle = StyleSheet.create({
    conntainer: {
        color: TV_GUIDE_CONSTANTS.THEME_STYLES.FUTURE_PROGRAM_TEXT_COLOR,
        height: TV_GUIDE_CONSTANTS.HEADER_CELL_HEIGHT,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    content: {
        color: TV_GUIDE_CONSTANTS.THEME_STYLES.FUTURE_PROGRAM_TEXT_COLOR,
        fontSize: TV_GUIDE_CONSTANTS.THEME_STYLES.TIME_LINE_TITLE_FONT_SIZE,
        textAlign: 'left'
    },
});
