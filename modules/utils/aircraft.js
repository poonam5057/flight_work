/**
 * @file
 * Aircraft related hooks and APIs
 *
 * @format
 * @flow strict-local
 */

import { useCallback, useMemo } from 'react';
import _ from 'lodash';

import app, { FieldValue, getUid, useDocumentData } from '@appFirebase';
import {
  getMyCompanyRef,
  getOverlappingTrips,
  queryTripsInRange,
  useList,
  useTripList,
} from '@appUtils/api';
import { Trip, UserRole } from '@appUtils/tripConverter';

export const useAircraftList = () => useList('aircraft');

export const useUserAircraft = ({ id = '', role = UserRole.OWNER } = {}) => {
  const query = useCallback(
    ref => {
      const field = role === UserRole.OWNER ? 'ownerIds' : 'pilotIds';
      return ref.collection('aircraft').where(field, 'array-contains', id);
    },
    [id, role],
  );

  return useList(query);
};

export const useAircraftData = documentPath => {
  return useDocumentData(documentPath && app.firestore().doc(documentPath));
};

export const createAircraft = async payload => {
  const companyRef = await getMyCompanyRef();
  const aircraftRef = companyRef.collection('aircraft').doc();

  return aircraftRef.set({
    ...payload,
    dateCreated: FieldValue.serverTimestamp(),
    createdBy: getUid(),
    ownerIds: _.map(payload.owners, 'id'),
    pilotIds: _.map(payload.pilots, 'id'),
  });
};

export const updateAircraft = async (payload, documentPath) => {
  const aircraftRef = app.firestore().doc(documentPath);
  return aircraftRef.set(
    {
      ..._.omit(payload, ['dateCreated', 'createdBy']),
      dateUpdated: FieldValue.serverTimestamp(),
      updatedBy: getUid(),
      ownerIds: _.map(payload.owners, 'id'),
      pilotIds: _.map(payload.pilots, 'id'),
    },
    { merge: true },
  );
};

export const useTripAircraft = (trip: Trip) => {
  const { data: aircraft } = useUserAircraft(trip.owner);
  const from = _.head(trip.legs)?.departureDate;
  const to = _.last(trip.legs)?.departureDate.endOf('day');

  const queryCb = useCallback(
    companyRef => {
      // Don't run the query if we don't yet have aircraft list loaded
      if (_.isEmpty(aircraft) || !from) {
        return undefined;
      }

      const adjustedFrom = from.minus({ days: 10 });

      return queryTripsInRange(companyRef, adjustedFrom, to).where(
        'aircraft.tailNumber',
        'in',
        aircraft.map(a => a.tailNumber),
      );
    },
    [aircraft, from, to],
  );

  const { data: trips, loading } = useTripList(queryCb);

  const [list, unavailable, available] = useMemo(() => {
    const options = { trips, from, to };
    const overlappingTrips = getOverlappingTrips(trip.identifier, options);

    const mapped = aircraft.map(craft => ({
      ...craft,
      overlappingTrips: overlappingTrips.filter(
        t => t.aircraft?.tailNumber === craft.tailNumber,
      ),
    }));

    return [mapped, ..._.partition(mapped, isUnavailable)];
  }, [aircraft, from, to, trip.identifier, trips]);

  return { available, unavailable, loading, list };
};

const isUnavailable = aircraft =>
  _.size(aircraft.overlappingTrips) > 0 ||
  Boolean(aircraft.squawks?.some(sq => sq.status === 'UFW'));
