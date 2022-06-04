/**
 * @file
 * Trip related hooks and APIs
 *
 * @format
 * @flow strict-local
 */
import { useCallback, useEffect, useMemo } from 'react';
import { useAsyncCallback } from 'react-async-hook';
import _ from 'lodash';

import app, {
  FieldValue,
  getUid,
  useCollection,
  useDocument,
  useDocumentData,
} from '@appFirebase';
import tripConverter, {
  OwnerState,
  PilotState,
  Trip,
  TripState,
  UserRole,
} from '@appUtils/tripConverter';

export const useTrip = documentPath => {
  const docRef = documentPath && app.firestore().doc(documentPath);
  const [snapshot, loading, error] = useDocument<Trip>(docRef);
  useEffect(() => error && console.error(error), [error]);

  const data = useMemo(() => {
    if (!snapshot?.exists) {
      return {};
    }

    return tripConverter.fromFirestore(snapshot);
  }, [snapshot]);

  return {
    // when documentPath changes the first few re-renders don't pick up we're loading a new document
    loading: loading || (documentPath && !snapshot),
    error,
    data,
    snapshot,
  };
};

export const useOwnerTrips = (id = getUid()) => {
  const query = useCallback(
    ref => {
      let qb = ref.collection('trips').where('owner.id', '==', id);
      return qb.orderBy('dateDeparting', 'desc');
    },
    [id],
  );

  return useTripList(query);
};

export const useMobileUserTrips = (archived = false) => {
  const [user] = useMyData();

  const query = useCallback(
    ref => {
      if (!user) {
        return undefined;
      }

      return getUserTripsQuery(ref, user, archived);
    },
    [archived, user],
  );

  return useTripList(query);
};

export const getUserTripsQuery = (companyRef, userData, archived = false) => {
  const id = getUid();
  let qb = companyRef.collection('trips').where('archived', '==', archived);

  if (userData.role === UserRole.OWNER) {
    qb = qb
      .where('owner.id', '==', id)
      .where('owner.state', '!=', 'Manager Draft')
      .orderBy('owner.state', 'desc');
  } else {
    const allowedStates = _.filter(
      PilotState,
      state => state !== PilotState.MANAGER_DRAFT,
    );
    qb = qb.where(
      'pilotStates',
      'array-contains-any',
      allowedStates.map(state => ({ id, state })),
    );
  }

  return qb.orderBy('dateDeparting', 'desc');
};

export const useTripList = (query = 'trips') =>
  useList<Trip>(query, tripConverter);

export function useList<TItem>(companyCollection, converter = null) {
  const [company, , companyError] = useMyCompanyRef();

  const query = useMemo(() => {
    if (!company) {
      return undefined;
    }

    const ref =
      typeof companyCollection === 'function'
        ? companyCollection(company)
        : company.collection(companyCollection);

    return ref;
  }, [company, companyCollection]);

  const [snapshot, , snapError] = useCollection<TItem>(query);
  const error = companyError || snapError;
  useEffect(() => error && console.error(error), [error]);

  const data = useMemo(
    () =>
      _.map(snapshot?.docs, doc => {
        const path = doc.ref.path;

        if (converter) {
          return converter.fromFirestore(doc);
        }

        return { ...doc.data(), path };
      }),
    [converter, snapshot?.docs],
  );

  return {
    loading: !snapshot && !error,
    error,
    data,
    snapshot,
  };
}

export const useCreateDraftCallback = () => useAsyncCallback(createDraft);

export const useCompanyData = () => {
  const [ref, refLoading] = useMyCompanyRef();
  const [company, loading] = useDocumentData(ref);

  return [company, loading || refLoading];
};

export const useCompanyUsers = (role = UserRole.EMPLOYEE) => {
  const [company, loading] = useCompanyData();

  const list = useMemo(() => {
    return _.filter(company?.users, user => _.includes(user.roles, role));
  }, [company?.users, role]);

  return [list, loading];
};

export const createDraft = async (defaults = {}) => {
  const companyRef = await getMyCompanyRef();
  const tripRef = companyRef.collection('trips').doc();

  const payload = tripConverter.toFirestore({
    aircraft: { tailNumber: null },
    legs: [],
    pilots: [],
    state: TripState.DRAFT,
    createdBy: getUid(),
    departingFrom: '',
    customName: '',
    archived: false,
    ...defaults,
  });

  payload.dateCreated = FieldValue.serverTimestamp();
  await tripRef.set(payload);

  return tripRef;
};

/**
 * Use this hook when you're listening for data
 * It will first load from cache making lists appear instantaneous
 * Use `getCompanyRef` to ensure the most recent data when you're making updates (e.g. create draft)
 * @returns {[*,boolean,firebase.FirebaseError]}
 */
export const useMyCompanyRef = () => {
  const [user, loading, error] = useMyData();
  return [user?.managementCompany.ref, loading, error];
};

export const useMyData = () => useDocumentData(getMyUserDoc());

export const getMyUserDoc = () =>
  app.firestore().collection('users').doc(getUid());

export const getMyCompanyRef = async () => {
  const user = await getUserData(getUid());
  return user.managementCompany.ref;
};

export const getUserData = async (uid = getUid()) => {
  const snap = await app.firestore().collection('users').doc(uid).get();
  return { id: snap.id, ...snap.data() };
};

/**
 * Remove unseen change from the trip and sets the SEEN status when appropriate
 * @param trip
 * @return {Promise<unknown>}
 */
export const markSeen = async (trip: Trip) => {
  const updates = {
    unseenChanges: {
      ...trip.unseenChanges,
      [getUid()]: [],
    },
  };

  const isOwner = trip.owner.id === getUid();

  if (isOwner) {
    if (trip.owner.state === OwnerState.MANAGER_UPDATED) {
      const company = await getMyCompanyRef();

      updates.owner = { ...trip.owner, state: OwnerState.OWNER_SEEN };
      updates.unseenChanges[company.id] = _.union(
        updates.unseenChanges?.[company.id],
        ['owner.state'],
      );
    }
  } else {
    const index = _.findIndex(trip.pilots, p => p.id === getUid());
    const pilot = _.get(trip.pilots, index);

    if (pilot?.state === PilotState.MANAGER_UPDATED) {
      const company = await getMyCompanyRef();
      updates.pilots = trip.pilots.map(p => ({
        ...p,
        state: p.id === getUid() ? PilotState.PILOT_SEEN : p.state,
      }));
      updates.unseenChanges[company.id] = _.union(
        updates.unseenChanges?.[company.id],
        [`pilots.${index}.state`],
      );
    }
  }

  const payload = tripConverter.toFirestore(updates);
  return app.firestore().doc(trip.path).update(payload);
};

export const countTrips = (trips = []) => {
  const counts = _.countBy(trips, trip => {
    const isSeen = _.isEmpty(trip.unseenChanges?.[getUid()]);

    if (!isSeen) {
      return 'unseen';
    }

    if (trip.owner?.id === getUid()) {
      if (trip.owner.state === OwnerState.MANAGER_REQUESTED) {
        return 'requested';
      }
    }

    const pilot = findMyPilotData(trip);
    if (pilot) {
      if (pilot.state === PilotState.MANAGER_REQUESTED) {
        return 'requested';
      }
    }

    return 'seen';
  });

  return _.merge({ seen: 0, unseen: 0, requested: 0 }, counts);
};

export const findMyPilotData = trip =>
  _.find(trip.pilots, p => p.id === getUid());

export const queryTripsInRange = (companyRef, from, to) =>
  companyRef
    .collection('trips')
    .where('archived', '==', false)
    .where('dateDeparting', '>=', from.toJSDate())
    .where('dateDeparting', '<=', to.toJSDate());

export const getOverlappingTrips = (id, { trips, from, to }) =>
  trips.filter(t => t.identifier !== id && isOverlapping(from, to, t));

const isOverlapping = (startBoundary, endBoundary, trip: Trip) => {
  const isActiveTrip = [
    TripState.OWNER_REQUEST,
    TripState.DRAFT,
    TripState.UPCOMING,
    TripState.ACTIVE,
  ].includes(trip.state);

  if (!isActiveTrip) {
    return false;
  }

  const tripStart = _.head(trip.legs)?.departureDate;
  const tripEnd = _.last(trip.legs)?.departureDate.endOf('day');

  return [
    [startBoundary, tripStart, tripEnd],
    [endBoundary, tripStart, tripEnd],
    [tripStart, startBoundary, endBoundary],
    [tripEnd, startBoundary, endBoundary],
  ].some(params => isBetweenDates(...params));
};

const isBetweenDates = (date, from, to) => from <= date && date <= to;
