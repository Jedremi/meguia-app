const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  'react-native-maps': require.resolve('./emptyModule.js'),
};

module.exports = defaultConfig;
