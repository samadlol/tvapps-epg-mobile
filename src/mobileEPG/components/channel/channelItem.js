import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { TV_GUIDE_CONSTANTS } from '../../constants';
import ChannelLogo from './channelLogo';
import PropTypes from 'prop-types';
import Styles from '../../styles';
import IconCartShoping from '../../assets/images/shopping_cart.png';
import FastImage from 'react-native-fast-image'

const PurchaseActiveComponent = ({ width, height }) => (
    <View style={[styles.purchaseContainer, { width: width, height: height, }]}>
        <FastImage source={IconCartShoping} style={styles.iconPurchase} imageStyle={styles.iconPurchaseImg} opacity={1} />
    </View>
)


class ChannelItem extends React.Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.channel !== this.props.channel) return true;
        return false;
    }

    render() {

        const { channel, channelHeight, index } = this.props;
        const { imageSrc, number, isPurchaseActivated } = channel;
        return (
            <View style={[styles.channel, { height: channelHeight, width: channelHeight }]}>
                {isPurchaseActivated && <PurchaseActiveComponent width={channelHeight} height={channelHeight} />}
                <View style={styles.numberChannelContainer}>
                    <Text style={styles.numberTitleText}>{number !== -1 ? number : null}</Text>
                </View>

                <ChannelLogo imageSrc={imageSrc} channelHeight={channelHeight} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    channel: {
        flex: 1,
        flexDirection: 'row',
        marginBottom: TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_LINE_MARGIN_BOTTOM,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    numberChannelContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 2,
        padding: 2,
    },
    numberTitleText: {
        color: TV_GUIDE_CONSTANTS.THEME_STYLES.FUTURE_PROGRAM_TEXT_COLOR,
        fontSize: TV_GUIDE_CONSTANTS.THEME_STYLES.CHANNEL_TITLE_FONT_SIZE,
        fontWeight: 'bold',
        opacity: 1,
    },
    purchaseContainer: {
        position: 'absolute',
        zIndex: 999,
        backgroundColor: '#8b8b8b',
        opacity: 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconPurchase: {
        width: '50%',
        height: '50%',
        resizeMode: 'center',
        opacity: 1,
        zIndex: 999,
        position: 'absolute'
    },
    iconPurchaseImg: {
        opacity: 1
    }
});

ChannelItem.propTypes = {
    channel: PropTypes.shape({
        imageSrc: PropTypes.string,
        id: PropTypes.number,
        externalChannelId: PropTypes.string,
        name: PropTypes.string,
        url: PropTypes.string,
        description: PropTypes.string,
        category: PropTypes.string,
        extrafields: PropTypes.array,
        number: PropTypes.number,
        npvrEnabled: PropTypes.bool,
        isNpvrActivated: PropTypes.bool,
        isCatchupActivated: PropTypes.bool,
        catchupEnabled: PropTypes.bool,
        favouriteEnabled: PropTypes.bool,
        isFavouriteActivated: PropTypes.bool,
        purchaseEnabled: PropTypes.bool,
        isPurchaseActivated: PropTypes.bool,
    }).isRequired
};

export default ChannelItem;


