import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { TV_GUIDE_CONSTANTS } from '../../constants';


export default function SkeletonComponent(props) {
    const { height, width, style } = props;

    return (
        <View style={[{ ...style }, styles.skeletonContainer, { height: height, marginBottom: TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_LINE_MARGIN_BOTTOM, width: width }]}>
        </View>
    );
}

const styles = StyleSheet.create({
    skeletonContainer: {
        backgroundColor: '#463cb4',
        borderRadius: 1
    }
})
