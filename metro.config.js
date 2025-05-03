const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// config.resolver.assetExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
