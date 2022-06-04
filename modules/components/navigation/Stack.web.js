/**
 * @file
 * Stack Navigator provides a way for our app to transition between screens where
 * each new screen is placed on top of a stack.
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type { Node } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { useWebScreenOptions } from './screenOptions';
import type { ScreenOptions } from './screenOptions';

const DefaultStack = createStackNavigator();

const Navigator = (props: { screenOptions?: ScreenOptions }): Node => {
  const options = useWebScreenOptions(props.screenOptions);
  return <DefaultStack.Navigator {...props} screenOptions={options} />;
};

export const Stack = {
  ...DefaultStack,
  Navigator,
};
