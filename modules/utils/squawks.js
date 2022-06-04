/**
 * @file
 * Squawk related hooks and APIs
 *
 * @format
 * @flow strict-local
 */

import { useEffect, useMemo } from 'react';
import _ from 'lodash';
import app, {
  FieldValue,
  getUid,
  useCollection,
  Timestamp,
} from '@appFirebase';
import { useMyCompanyRef } from '@appUtils/api';
import { DateTime } from 'luxon';

export const SquawkStatus = {
  UNDEFINED: 'UD',
  MEL: 'MEL',
  UNFLIGHTWORTHY: 'UFW',
  ARCHIVED: 'Archived',
};

export const useAircraftSquawkList = ({ aircraftId, archived }) => {
  const [company, , companyError] = useMyCompanyRef();
  const query = useMemo(() => {
    if (!company) {
      return undefined;
    }

    const ref = company
      .collection(`aircraft/${aircraftId}/squawks`)
      .where('currentStatus', archived ? '==' : '!=', SquawkStatus.ARCHIVED);

    return ref;
  }, [aircraftId, archived, company]);

  const [snapshot, , snapError] = useCollection<TItem>(query);
  const error = companyError || snapError;
  useEffect(() => error && console.error(error), [error]);

  const data = useMemo(
    () =>
      _.map(snapshot?.docs, doc => {
        const path = doc.ref.path;

        return { ...doc.data(), path };
      }),
    [snapshot?.docs],
  );

  return {
    loading: !snapshot && !error,
    error,
    data,
    snapshot,
  };
};

export const useTripSquawkList = ({ aircraftId, tripId }) => {
  const [company, , companyError] = useMyCompanyRef();
  const query = useMemo(() => {
    if (!company) {
      return undefined;
    }

    const ref = company
      .collection(`aircraft/${aircraftId}/squawks`)
      .where('trip.identifier', '==', tripId);

    return ref;
  }, [aircraftId, company, tripId]);

  const [snapshot, , snapError] = useCollection<TItem>(query);
  const error = companyError || snapError;
  useEffect(() => error && console.error(error), [error]);

  const data = useMemo(
    () =>
      _.map(snapshot?.docs, doc => {
        const path = doc.ref.path;

        return { ...doc.data(), path };
      }),
    [snapshot?.docs],
  );

  return {
    loading: !snapshot && !error,
    error,
    data,
    snapshot,
  };
};

export const updateSquawk = async ({
  payload,
  squawkPath,
  statusChanged = false,
}) => {
  const squawkRef = app.firestore().doc(squawkPath);
  let data = {
    ...payload,
    dateUpdated: FieldValue.serverTimestamp(),
    updatedBy: getUid(),
  };
  if (statusChanged) {
    data.status = [
      ...data.status,
      {
        // time: Timestamp.fromMillis(DateTime.now().toMillis()),
        setBy: getUid(),
        value: data.currentStatus,
      },
    ];
  }
  return squawkRef.set(data, { merge: true });
};

export const deleteSquawk = async squawkPath => {
  return await app.firestore().doc(squawkPath).delete();
};

export const createSquawk = async ({ payload, collection }) => {
  const squawkRef = app.firestore().collection(collection).doc();
  return await squawkRef.set({
    ...payload,
    dateCreated: FieldValue.serverTimestamp(),
    currentStatus: SquawkStatus.UNDEFINED,
    status: [
      {
        // time: Timestamp.fromMillis(DateTime.now().toMillis()),
        setBy: getUid(),
        value: SquawkStatus.UNDEFINED,
      },
    ],
  });
};
