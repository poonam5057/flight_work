/**
 * @file
 * The Passengers stack and related screens
 *
 * Screens that belong to the Passengers tab should be added here
 *
 * @format
 * @flow strict-local
 */

import React from 'react';

import { Stack } from '@appComponents/navigation';
import Passengers from './Passengers';
import EditPassenger, { EditPassengerHeaderLeft } from './EditPassenger';

const PassengerStack = ({ mainOptions, children }) => (
  <Stack.Navigator initialRouteName="Passengers">
    <Stack.Screen
      name="Passengers"
      component={Passengers}
      options={mainOptions}
    />
    <Stack.Group>
      <Stack.Screen
        name="Edit Passenger"
        component={EditPassenger}
        options={subScreenOptions}
      />
    </Stack.Group>
    {children}
  </Stack.Navigator>
);

const subScreenOptions = ({ route, navigation }) => ({
  title: '',
  headerLeft: props => (
    <EditPassengerHeaderLeft {...props} route={route} navigation={navigation} />
  ),
});

export default PassengerStack;
