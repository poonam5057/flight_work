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
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useNativeScreenOptions } from './screenOptions';
import type { ScreenOptions } from './screenOptions';

const NativeStack = createNativeStackNavigator();

const Navigator = (props: { screenOptions?: ScreenOptions }): Node => {
  const options = useNativeScreenOptions(props.screenOptions);
  return <NativeStack.Navigator {...props} screenOptions={options} />;
};

export const Stack = {
  ...NativeStack,
  Navigator,
};
