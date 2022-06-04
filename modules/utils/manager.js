/**
 * @file
 * Manager related hooks and APIs
 *
 * @format
 * @flow strict-local
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import _ from 'lodash';

import app from '@appFirebase/app';
import * as API from './api';
import {
  getOverlappingTrips,
  queryTripsInRange,
  useList,
  useMyData,
  useTripList,
} from './api';
import tripConverter, { OwnerState, PilotState, Trip } from './tripConverter';
import { FieldValue, getUid } from '@appFirebase';

export const AccountState = {
  NEW: 'New Request',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

export const useTrip = documentPath => {
  const [, forceRefresh] = useState();
  const [docPath, setDocPath] = useState(documentPath);
  const updates = useRef<Trip>({});
  const { data: existingData, ...controller } = API.useTrip(docPath);

  const save = useCallback(async () => {
    let path = docPath;

    if (!docPath) {
      const docRef = await API.createDraft();
      path = docRef.path;
      setDocPath(path);
    }

    await saveTrip(updates.current, existingData, path);
    updates.current = {};
    forceRefresh({});
  }, [docPath, existingData]);

  const update = useCallback((partial: Trip) => {
    updates.current = { ...updates.current, ...partial };
    forceRefresh({});
  }, []);

  const reset = useCallback(() => {
    updates.current = {};
    setDocPath(documentPath);
  }, [documentPath]);

  const data = {
    ...existingData,
    ...updates.current,
  };

  return {
    ...controller,
    save,
    update,
    reset,
    data,
    hasUnsavedChanges: _.size(updates.current) > 0,
  };
};

export const useAccountRequestHandler = request => {
  const [user] = useMyData();
  return useCallback(
    async (state, role = request.role) => {
      const requestDoc = app.firestore().doc(request.path);

      if (state === AccountState.REJECTED) {
        return requestDoc.update({
          state: AccountState.REJECTED,
          rejectedBy: getUid(),
        });
      }

      const updateUser = app
        .firestore()
        .collection('users')
        .doc(request.uid)
        .update({
          managementCompany: user.managementCompany,
          role,
        });

      const includeInCompanyList = user.managementCompany.ref.update({
        users: FieldValue.arrayUnion({
          id: request.uid,
          firstName: request.firstName,
          lastName: request.lastName,
          phoneNumber: request.phoneNumber,
          email: request.email,
          roles: [role],
        }),
      });

      const updateRequestState = requestDoc.update({
        state: AccountState.ACCEPTED,
        acceptedBy: getUid(),
        role,
      });

      return Promise.all([
        updateUser,
        includeInCompanyList,
        updateRequestState,
      ]);
    },
    [request, user?.managementCompany],
  );
};

export const useAccountRequests = states => {
  const queryCallback = useCallback(
    companyRef => {
      const state = states || [AccountState.NEW, AccountState.REJECTED];
      return companyRef
        .collection('accountRequests')
        .where('state', 'in', state);
    },
    [states],
  );

  return useList(queryCallback);
};

export const useTripPilotOptions = (trip: Trip, pilotList) => {
  const from = _.head(trip.legs)?.departureDate;
  const to = _.last(trip.legs)?.departureDate.endOf('day');

  const queryCb = useCallback(
    companyRef => {
      // Don't run the query if we don't have a start date or aircraft picked up
      if (!from || _.isEmpty(pilotList)) {
        return undefined;
      }

      const adjustedFrom = from.minus({ days: 10 });
      return queryTripsInRange(companyRef, adjustedFrom, to);
    },
    [from, pilotList, to],
  );

  const { data: trips, loading } = useTripList(queryCb);

  return useMemo(() => {
    if (_.isEmpty(trip) || _.isEmpty(pilotList)) {
      return { loading };
    }

    const searchParams = { trips, from, to };
    const overlappingTrips = getOverlappingTrips(trip.identifier, searchParams);
    const unavailableIds = new Set(
      overlappingTrips.flatMap(t => t.pilots.map(p => p.id)),
    );

    const [unavailable, available] = _.chain(pilotList)
      .map(pilot => ({ ...pilot, state: PilotState.MANAGER_DRAFT }))
      .partition(pilot => unavailableIds.has(pilot.id))
      .value();

    return { available, unavailable, unavailableIds, loading };
  }, [from, loading, pilotList, to, trip, trips]);
};

/**
 * Save a trip and capture changes
 * @param partial
 * @param existingData
 * @param docPath
 * @returns {Promise<void>}
 */
function saveTrip(partial: Trip, existingData: Trip, docPath: string) {
  const payload = getPayload(partial, existingData);
  const doc = app.firestore().doc(docPath);
  return doc.set(payload, { merge: true });
}

/**
 * Gets the payload for a trip update with captured changes
 * @param partial
 * @param existingData
 * @return {Trip}
 */
export const getPayload = (partial: Trip, existingData: Trip) => {
  const ids = getIds(existingData);
  partial = setStatuses(partial, existingData);
  const changes = _.size(ids) > 0 ? findChanges(existingData, partial) : {};
  let unseen = toPaths(changes, ids, existingData.unseenChanges);
  unseen = addUnseenChangeForNewRequests(partial, existingData, unseen);

  const payload = tripConverter.toFirestore(partial);
  payload.unseenChanges = unseen;

  return payload;
};

/**
 * Get the IDs of assigned trip users in non default states
 * @param trip
 * @returns {Array<string>}
 */
const getIds = (trip: Trip): string[] => {
  const owner = trip.owner;
  const p1 = _.get(trip, ['pilots', '0']);
  const p2 = _.get(trip, ['pilots', '1']);

  const ids = [
    _.get(owner, 'state', OwnerState.MANAGER_DRAFT) !==
      OwnerState.MANAGER_DRAFT && owner?.id,
    _.get(p1, 'state', PilotState.MANAGER_DRAFT) !== PilotState.MANAGER_DRAFT &&
      p1?.id,
    _.get(p2, 'state', PilotState.MANAGER_DRAFT) !== PilotState.MANAGER_DRAFT &&
      p2?.id,
  ].filter(Boolean);

  return ids;
};

/**
 * Retrieve only the changes from a partial (deep compare)
 * @param source
 * @param partial
 * @returns {Object}
 */
const findChanges = (source: Object, partial: Object): Object => {
  const merged = _.merge({}, source, partial);

  return _.transform(merged, (result, value, key) => {
    const sourceValue = _.get(source, key);
    if (_.isEqual(value, sourceValue)) {
      return;
    }

    result[key] = value;

    if (shouldTrackDeeperChanges(value, key)) {
      result[key] = findChanges(sourceValue, value);
    }
  });
};

/**
 * When manager requests the trip we add `state` to unseenChanges so that a badge appears
 * in the Owner/Pilot app
 * @param partial
 * @param existingData
 * @param unseen
 */
const addUnseenChangeForNewRequests = (
  partial: Trip,
  existingData: Trip,
  unseen: Object,
) => {
  // When there is no unseen changes map (or no IDs inside) this is a newly created trip
  // We add a single unseen change to everybody involved, so they get a badge
  if (_.isEmpty(existingData.unseenChanges)) {
    if (partial.owner) {
      unseen[partial.owner.id] = ['state'];
    }

    _.forEach(partial.pilots, p => {
      unseen[p.id] = ['state'];
    });
  }

  return unseen;
};

/**
 * Covert changes to a map of unseenChanges for each user id
 * @param changes
 * @param ids
 * @param existing
 * @returns {Object}
 */
const toPaths = (
  changes = {},
  ids: [],
  existing = {},
): Trip['unseenChanges'] => {
  if (_.isEmpty(ids)) {
    return {};
  }

  const paths = getPaths(changes);
  const pairs = ids.map(id => [id, _.union(paths, existing[id])]);

  return _.fromPairs(pairs);
};

const getPaths = (value, rootKey = '') => {
  if (shouldTrackDeeperChanges(value)) {
    return _.keys(value).flatMap(key =>
      getPaths(value[key], rootKey ? `${rootKey}.${key}` : key),
    );
  }

  return rootKey;
};

/**
 * We can use this to exclude some keys from change tracking
 * @param value
 * @param key
 */
const shouldTrackDeeperChanges = (value: any, key: string) => {
  return _.isObject(value) && !DateTime.isDateTime(value);
};

/**
 * Update partial data and set everybody on the trip as "Updated"
 * Note: this also serves to send the Saved Draft to everybody
 * @param updates
 * @param existing
 * @return Trip
 */
const setStatuses = (updates: Trip, existing: Trip) => {
  const merged = { ...existing, ...updates };
  const updated = {
    ...updates,
    owner: merged.owner && {
      ...existing.owner,
      ...updates.owner,
      state: getOwnerState(merged.owner.state),
    },
    pilots: merged.pilots?.map((p, i) => ({
      ...p,
      ..._.get(updates, ['pilots', i], {}),
      state: getPilotState(p.state),
    })),
  };

  return updated;
};

const getPilotState = state => {
  const updatableStates = [
    PilotState.PILOT_ACCEPTED,
    PilotState.PILOT_REJECTED,
    PilotState.PILOT_SEEN,
    PilotState.MANAGER_CANCELED,
  ];
  if (!state || state === PilotState.MANAGER_DRAFT) {
    return PilotState.MANAGER_REQUESTED;
  }
  if (_.includes(updatableStates, state)) {
    return PilotState.MANAGER_UPDATED;
  }

  return state;
};

const getOwnerState = state => {
  const updatableStates = [
    OwnerState.OWNER_REQUESTED,
    OwnerState.OWNER_ACCEPTED,
    OwnerState.OWNER_SEEN,
    OwnerState.OWNER_DRAFT,
    OwnerState.MANAGER_ACKNOWLEDGED,
  ];

  if (!state || state === OwnerState.MANAGER_DRAFT) {
    return OwnerState.MANAGER_REQUESTED;
  }

  if (_.includes(updatableStates, state)) {
    return OwnerState.MANAGER_UPDATED;
  }

  return state;
};
