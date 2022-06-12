import React from 'react';
import { Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import DefaultImagePreview from '../../assets/images/default_channel_logo.png';
import FastImage from 'react-native-fast-image'

export default function ProgramImagePreview(props) {
    const { imageHeight, source } = props;
    const imageWidth = imageHeight * 16 / 9;
    const imageContainerFlatten = StyleSheet.flatten([styles.imageContainer, { width: imageWidth, height: imageHeight }]);
    const sourceImg = source ? { uri: source } : DefaultImagePreview

    return (
        <FastImage
            style={imageContainerFlatten}
            source={sourceImg}
            resizeMode={FastImage.resizeMode.stretch}
        />
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        backgroundColor: 'white'
    }
});

ProgramImagePreview.propTypes = {
    imageHeight: PropTypes.number.isRequired,
    source: PropTypes.string,
};

ProgramImagePreview.defaultProps = {
    imageHeight: 50,
};
