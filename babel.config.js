module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Disable the reanimated babel plugin — we use React Native's built-in
      // Animated API, not Reanimated worklets. This prevents the
      // 'react-native-worklets/plugin' error on web builds.
      //
      // If you later use Reanimated's `useAnimatedStyle` / `useSharedValue`,
      // re-enable this and install react-native-worklets-core:
      // ['react-native-reanimated/plugin'],
    ],
  };
};
