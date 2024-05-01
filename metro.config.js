const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        redirectModulePath: require.resolve('react-native-svg'),
    }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
