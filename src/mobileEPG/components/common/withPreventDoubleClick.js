import React from 'react';
import { debounce } from 'lodash';
import { TV_GUIDE_CONSTANTS } from '../../constants';

export default withPreventDoubleClick = (WrappedComponent) => {

    class PreventDoubleClick extends React.PureComponent {

        debouncedOnPress = () => {
            this.props.onPress && this.props.onPress();
        }

        onPress = debounce(this.debouncedOnPress, TV_GUIDE_CONSTANTS.DEBOUNCE_TIME, { leading: true, trailing: false });

        render() {
            return <WrappedComponent {...this.props} onPress={this.onPress} />;
        }
    }

    PreventDoubleClick.displayName = `withPreventDoubleClick(${WrappedComponent.displayName || WrappedComponent.name})`
    return PreventDoubleClick;
};