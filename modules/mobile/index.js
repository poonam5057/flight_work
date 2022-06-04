/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
import MobileApp from './MobileApp';

if (Platform.OS === 'ios') {
  /**
   * Polyfills required to use Intl until Hermes v0.8.1 is released for ios
   * This is used internally by luxon (DateTime)
   * https://github.com/facebook/hermes/issues/23#issuecomment-912528102
   */
  require('@formatjs/intl-getcanonicallocales/polyfill').default;

  require('@formatjs/intl-locale/polyfill').default;

  require('@formatjs/intl-pluralrules/polyfill').default;
  require('@formatjs/intl-pluralrules/locale-data/en').default;

  require('@formatjs/intl-numberformat/polyfill').default;
  require('@formatjs/intl-numberformat/locale-data/en').default;

  require('@formatjs/intl-datetimeformat/polyfill').default;
  require('@formatjs/intl-datetimeformat/locale-data/en').default; // locale-data for en
  require('@formatjs/intl-datetimeformat/add-all-tz').default; // Add ALL tz data
}

AppRegistry.registerComponent('flightworks', () => MobileApp);
