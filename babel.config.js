const path = require('path');

const componentsDir = path.resolve(__dirname, 'modules/components');
const webComponentsDir = path.resolve(__dirname, 'modules/web/components');
const mobileComponentsDir = path.resolve(
  __dirname,
  'modules/mobile/components',
);
const firebaseDir = path.resolve(__dirname, 'modules/firebase');
const utilsDir = path.resolve(__dirname, 'modules/utils');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],

  plugins: [
    'optional-require',
    [
      'module-resolver',
      {
        root: ['./modules'],
        extensions: ['.ios.js', '.android.js', '.native.js', '.js', '.json'],
        alias: {
          '@appComponents': componentsDir,
          '@webComponents': webComponentsDir,
          '@mobileComponents': mobileComponentsDir,
          '@appFirebase': firebaseDir,
          '@appUtils': utilsDir,
          /* We alias these modules to silence errors coming from react-native-paper
           * We can ignore these errors because we're using our custom icons and not vector-icons */
          'react-native-vector-icons/MaterialCommunityIcons': path.resolve(
            componentsDir,
            'theme/Icon.js',
          ),
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],

  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
};
