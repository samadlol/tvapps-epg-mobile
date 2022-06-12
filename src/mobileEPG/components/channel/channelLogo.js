import React from 'react';
import { StyleSheet, View, Image, } from 'react-native';
import PropTypes from 'prop-types';
import Styles from '../../styles';
import defaultChannelLogo from '../../assets/images/default_channel_logo.png';
import ImageMaskChannel from '../../assets/images/channel_mask.png';
import FastImage from 'react-native-fast-image'


const ChannelLogo = ({ imageSrc, channelHeight }) => {
    const src = imageSrc ? { uri: imageSrc } : defaultChannelLogo;

    return (
        <View style={styles.containerLogoChannel}>
            <View style={[styles.maskImage, { width: channelHeight, height: channelHeight, opacity: 0.4 }]}>
                <FastImage
                    style={[ { width: channelHeight, height: '100%', opacity: 1, zIndex: 999}]}
                    source={ImageMaskChannel}
                    resizeMode={FastImage.resizeMode.cover}
                    opacity={1}
                />
            </View>
            <FastImage
                style={[styles.channelLogo, { width: channelHeight, height: channelHeight, }]}
                source={src}
                resizeMode={FastImage.resizeMode.contain}
                
            />
        </View>
    );
};

const styles = StyleSheet.create({
    containerLogoChannel: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    channelLogo: {
        height: '100%',
        resizeMode: 'contain',
        backgroundColor: 'transparent',
    },
    maskImage: {
        zIndex: 999,
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(255,255,255,.8)'
    }
});

ChannelLogo.propTypes = {
    imageSrc: PropTypes.string,
    channelHeight: PropTypes.number.isRequired,
};

export default React.memo(ChannelLogo);