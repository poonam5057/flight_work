import { AppRegistry } from 'react-native';

import MC_App from './WebApp';

AppRegistry.registerComponent('ManagementCompanyApp', () => MC_App);
AppRegistry.runApplication('ManagementCompanyApp', {
  rootTag: document.getElementById('react-native-app'),
});
