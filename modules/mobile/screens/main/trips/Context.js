/**
 * @file
 * Context exposed to the Trips Stack and sub views
 *
 * @format
 * @flow strict-local
 */
import React, { createContext, useContext, useEffect, useMemo } from 'react';

import type { Trip, TripStateValue } from '@appUtils/tripConverter';
import { useMobileUserTrips } from '@appUtils/api';

export const TripContextProvider = ({ children }): Node => {
  const { data: trips, loading, error } = useMobileUserTrips();
  useEffect(() => error && console.error(error), [error]);

  return (
    <TripContext.Provider value={[trips, loading]}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = (state?: TripStateValue | TripStateValue[]) => {
  const [ctxTrips, loading] = useContext(TripContext);
  return useMemo(() => {
    if (!state) {
      return { trips: ctxTrips, loading };
    }

    const trips = ctxTrips.filter(
      (trip: Trip) => trip.state === state || state.includes(trip.state),
    );

    return { trips, loading };
  }, [ctxTrips, loading, state]);
};

export const useTrip = (id): { trip?: Trip, loading: boolean } => {
  const [ctxTrips, loading] = useContext(TripContext);
  return useMemo(
    () => ({
      loading,
      trip: ctxTrips.find(t => t.identifier === id),
    }),
    [ctxTrips, id, loading],
  );
};

const DEFAULT_VALUE: [Trip[], boolean] = [[], false];
const TripContext = createContext(DEFAULT_VALUE);
