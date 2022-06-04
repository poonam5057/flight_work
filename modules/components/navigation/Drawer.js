/**
 * @file
 * A sidebar navigation that can be opened, closed or kept fixed to the side
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { useWebScreenOptions } from './screenOptions';
import type { ScreenOptions } from './screenOptions';

const DefaultDrawer = createDrawerNavigator();

const Navigator = (props: { screenOptions?: ScreenOptions }): Node => {
  const options = useWebScreenOptions(props.screenOptions);
  return <DefaultDrawer.Navigator {...props} screenOptions={options} />;
};

export const Drawer = {
  ...DefaultDrawer,
  Navigator,
};
