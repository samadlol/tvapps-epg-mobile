import { Platform, PixelRatio, StyleSheet } from 'react-native';

// Get pixel ratio
let pixelRatio = PixelRatio.get();
if (Platform.OS === 'web') {
  pixelRatio = 1;
}

// Screen height
let height = 1080;
const Styles = {
  px: (size) => {
    return Math.round((size * (height / 1080)) / pixelRatio);
  },
};

export default Styles;
