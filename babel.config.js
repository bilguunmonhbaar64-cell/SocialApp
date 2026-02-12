// Babel config for Expo + NativeWind + Reanimated (SDK 50+)
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Expo preset now includes the Expo Router transform
      "babel-preset-expo",
      // NativeWind ships as a preset (adds its own plugins internally)
      "nativewind/babel",
    ],
    plugins: [
      // Must stay last for React Native Reanimated
      "react-native-reanimated/plugin",
    ],
  };
};
