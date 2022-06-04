/**
 * @file
 * The Trips stack and related screens
 *
 * Screens that belong to the Trips tab should be added here
 *
 * @format
 * @flow strict-local
 */

import React from 'react';

import { Stack } from '@appComponents/navigation';
import Trips from './Trips';
import { TripContextProvider } from './Context';
import HeaderLeft, { subScreenOptions } from '../../../components/HeaderLeft';
import ListTrips, { OwnerDraftTrips } from './ListTrips';
import TripBuilder from './TripBuilder';
import TripReview, { TripReviewHeaderLeft } from './TripReview';
import TripPassengers, { TripPassengersHeaderLeft } from './TripPassengers';
import EditPassenger from '../passengers/EditPassenger';
import ArchivedTrips from './ArchivedTrips';
import Squawk from '../Squawk';
import UpdateFuel, { UpdateFuelHeaderLeft } from './UpdateFuel';

const TripStack = ({ mainOptions, children }) => {
  return (
    <TripContextProvider>
      <Stack.Navigator initialRouteName="Overview">
        <Stack.Screen name="Overview" component={Trips} options={mainOptions} />
        <Stack.Group screenOptions={subScreenOptions}>
          <Stack.Screen name="List" component={ListTrips} />
          <Stack.Screen name="Owner Drafts" component={OwnerDraftTrips} />
          <Stack.Screen name="Trip Builder" component={TripBuilder} />
          <Stack.Screen name="Archived Trips" component={ArchivedTrips} />
          <Stack.Screen
            name="Trip Passengers"
            component={TripPassengers}
            options={passengersScreenOptions}
          />
          <Stack.Screen
            name="Edit Trip Passenger"
            component={EditPassenger}
            options={passengersScreenOptions}
          />
          <Stack.Screen
            name="Trip Review"
            component={TripReview}
            options={reviewScreenOptions}
          />
          <Stack.Screen name="Squawk" component={Squawk} />
          <Stack.Screen name="Update Fuel" component={UpdateFuel} options={UpdateFuelScreenOptions} />
        </Stack.Group>
        {children}
      </Stack.Navigator>
    </TripContextProvider>
  );
};

const passengersScreenOptions = params => {
  return {
    ...subScreenOptions(params),
    headerLeft: props => <TripPassengersHeaderLeft {...props} {...params} />,
  };
};

const reviewScreenOptions = params => {
  return {
    ...subScreenOptions(params),
    headerLeft: props => <TripReviewHeaderLeft {...props} {...params} />,
  };
};

const UpdateFuelScreenOptions = params => ({
  title: '',
  headerLeft: props => (<UpdateFuelHeaderLeft {...props} {...params} />
  ),
});


export default TripStack;
