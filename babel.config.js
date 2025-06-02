module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '^react-native$': 'react-native-web',
          '^@/(.*)': './src/\\1',
          'react-native-maps': './emptyModule.js'
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
