/**
 * Common App top level providers
 *
 * @format
 * @flow strict-local
 */
import React from 'react';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import { ThemeProvider } from './theme';
import { AppNavigation, LinkingOptions } from './navigation';

type AppProps = {
  children: Node,
  themeOverrides: Object,
  linking: LinkingOptions,
};

const App = ({ children, linking, themeOverrides }: AppProps): Node => (
  <ThemeProvider {...themeOverrides}>
    <AppNavigation linking={linking}>{children}</AppNavigation>
  </ThemeProvider>
);

export default gestureHandlerRootHOC(App);
