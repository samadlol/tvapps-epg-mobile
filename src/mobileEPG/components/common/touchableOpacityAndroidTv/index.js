import React, {Component} from 'react';
import {Platform, TouchableOpacity, findNodeHandle} from 'react-native';

let TouchableOpacityTV = TouchableOpacity;

class TouchableOpacityAndroidTV extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false,
        };
        this.lastPressEvent = undefined;
    }

    // Make sure presses on AndroidTV are sent only once
    onPressFilter = e => {
        const {onPress} = this.props;
        const {eventKeyAction} = e;
        if (
            onPress &&
            ((this.lastPressEvent === undefined &&
                eventKeyAction === undefined) ||
                (this.lastPressEvent === 0 && eventKeyAction === 1))
        ) {
            onPress(e);
        }
        this.lastPressEvent = eventKeyAction;
    };

    focus = () => {
        this.touchRef.setNativeProps({hasTVPreferredFocus: true});
    };

    setNativeProps = nProps => {
        this.touchRef.setNativeProps(nProps);
    };

    onRef = ref => {
        this.touchRef = ref;
        if (ref) {
            let nprops = {};
            let doSet = false;

            if (this.props.nextFocusLeft) {
                nprops.nextFocusLeft = this.nextFocusLeft;
                doSet = true;
            }
            if (this.props.nextFocusRight) {
                nprops.nextFocusRight = this.props.nextFocusRight;
                doSet = true;
            }

            if (this.props.firstFocusLeft) {
                nprops.nextFocusLeft = findNodeHandle(this.touchRef);
                doSet = true;
            }
            if (this.props.lastFocusRight) {
                nprops.nextFocusRight = findNodeHandle(this.touchRef);
                doSet = true;
            }
            if (this.props.lastFocusDown) {
                nprops.nextFocusDown = findNodeHandle(this.touchRef);
                doSet = true;
            }
            if (this.props.firstFocusTop) {
                nprops.nextFocusUp = findNodeHandle(this.touchRef);
                doSet = true;
            }
            if (doSet) {
                this.setNativeProps(nprops);
            }
        }
    };

    onFocus = () => {
        this.setState({focused: true});
        if (this.props.onFocus) {
            this.props.onFocus();
        }
    };

    onBlur = () => {
        this.setState({focused: false});
        if (this.props.onBlur) {
            this.props.onBlur();
        }
    };

    render() {
        return (
            <TouchableOpacity
                activeOpacity={1.0}
                {...this.props}
                onPress={this.onPressFilter}
                clickable={true}
                ref={this.onRef}
                onFocus={this.onFocus}
                onBlur={this.onBlur}>
                <>
                    {React.cloneElement(this.props.children, {
                        focused: this.state.focused,
                        highlighted: this.state.focused,
                    })}
                </>
            </TouchableOpacity>
        );
    }
}

if (Platform.OS === 'android' && Platform.isTV) {
    TouchableOpacityTV = TouchableOpacityAndroidTV;
}

export {TouchableOpacityTV as TouchableOpacity};