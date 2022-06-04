import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useNavigation } from '@react-navigation/native';
import { BorderedButton } from '@appComponents/Button';
import { findMyPilotData, useMyData } from '@appUtils/api';
import { useTrips } from './Context';
import TripsList from '../../../components/TripsList';
import { getStateWeight, UserRole } from '@appUtils/tripConverter';

const ListTrips = ({ route }): Node => {
  const { states, title } = route.params;
  const { trips, loading } = useOrderedTrips(states);

  const showMessagesButton = _.every(states, s => s !== 'Completed');

  return (
    <TripsList
      title={title}
      loading={loading}
      trips={trips}
      showMessagesButton={showMessagesButton}
    />
  );
};

const TripBuilderButton = () => {
  const navigation = useNavigation();
  return (
    <BorderedButton
      color="secondary"
      width="88%"
      mt={3}
      aSelf="center"
      onPress={() => navigation.navigate('Trip Builder')}>
      + Trip Builder
    </BorderedButton>
  );
};

export const OwnerDraftTrips = props => {
  return (
    <>
      <TripBuilderButton />
      <ListTrips {...props} />
    </>
  );
};

/**
 * Trips are ordered only once after the list is opened
 * This prevents trips from changing their position in the list due to re-sorting
 *
 * More Information:
 * Trips are ordered based on their status, ownerStatus, departureDate etc.
 * Accepting a trip shouldn't make the trip card move out of view because it's priority is now lower.
 * Opening an "Updated" trip and going back should exit on the now "Seen" trip as well
 * This also prevents live changes made by a manager change your list position
 */
const useOrderedTrips = states => {
  const data = useTrips(states);
  const [user, userLoading] = useMyData();
  const [trips, setTrips] = useState();
  const loading = !trips || data.loading || userLoading;

  useEffect(() => {
    if (!user?.role) {
      return;
    }

    setTrips(prevTrips => {
      // When we already sorted and set fixedTrips we only propagate changes but not re-sorting
      if (_.size(prevTrips) > 0) {
        return _.map(
          prevTrips,
          trip => data.trips.find(t => trip.path === t.path) || trip,
        );
      }

      if (user.role === UserRole.OWNER) {
        return _.sortBy(data.trips, trip => getStateWeight(trip.owner?.state));
      }

      return _.sortBy(data.trips, trip => {
        const pilot = findMyPilotData(trip);
        return getStateWeight(pilot?.state);
      });
    });
  }, [data.trips, user?.role]);

  return { loading, trips };
};

export default ListTrips;
