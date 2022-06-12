import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { TV_GUIDE_CONSTANTS } from '../../constants';

function LoadingIndicator() {
    return (
        <View style={styles.loadingIndicator}>
            <ActivityIndicator size="large" color={TV_GUIDE_CONSTANTS.THEME_STYLES.LOADING_INDICATOR_COLOR} />
        </View>
    );
}

export default React.memo(LoadingIndicator);

const styles = StyleSheet.create({
    loadingIndicator: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: TV_GUIDE_CONSTANTS.THEME_STYLES.LOADING_INDICATOR_BG_COLOR,
        width: TV_GUIDE_CONSTANTS.DEVICE_WIDTH,
        height: TV_GUIDE_CONSTANTS.DEVICE_HEIGHT
    }
});

