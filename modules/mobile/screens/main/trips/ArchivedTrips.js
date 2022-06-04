/**
 * @file
 * Archived trips screen
 *
 * @format
 * @flow strict-local
 */
import React from 'react';

import TripsList from '../../../components/TripsList';
import { useMobileUserTrips } from '@appUtils/api';

type ArchivedTripsProps = {};

const ArchivedTrips = (props: ArchivedTripsProps): Node => {
  const { data: trips, loading } = useMobileUserTrips(true);

  return <TripsList title="Archived Trips" loading={loading} trips={trips} />;
};

export default ArchivedTrips;
