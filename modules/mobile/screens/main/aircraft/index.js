/**
 * @file
 * The Aircraft stack and related screens
 *
 * @format
 * @flow strict-local
 */

import React from 'react';

import { Stack } from '@appComponents/navigation';
import { subScreenOptions } from '../../../components/HeaderLeft';
import AircraftDetails from './AircraftDetails';
import AircraftList from './AircraftList';
import Squawk from '../Squawk';

const AircraftStack = ({ mainOptions, children }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Aircraft"
        component={AircraftList}
        options={mainOptions}
      />
      <Stack.Group screenOptions={subScreenOptions}>
        <Stack.Screen name="Aircraft Details" component={AircraftDetails} />
        <Stack.Screen name="Squawk" component={Squawk} />
      </Stack.Group>
      {children}
    </Stack.Navigator>
  );
};

export default AircraftStack;
