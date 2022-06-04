/**
 * Firestore snapshot converter for Trips
 * Use this to convert any values from/to firestore compatible values
 * E.g. when data is pulled convert dates to DateTime objects
 * when data is pushed convert DateTime objects to regular dates (or Firestore timestamps)
 *
 * @format
 * @flow strict-local
 */

import { DateTime } from 'luxon';
import _ from 'lodash';
import {
  DocumentData,
  SnapshotOptions,
  QueryDocumentSnapshot,
  FieldValue,
  getUid,
} from '@appFirebase';

export type Trip = {
  aircraft: { tailNumber: string, type: string, name: string, path: string },
  pilots: Array<{ id: UserID, state: PilotStateValue }>,
  legs: Array<{
    departureDate: DateTime,
    from: string,
    to: string,
    passengers: Array<{ name: string }>,
  }>,
  state: TripStateValue,
  dateCreated: DateTime,
  dateUpdated: DateTime,
  createdBy: string,
  identifier: string,
  id: string,
  path: string,
  customName: string,
  notes: string,
  archived: boolean,
  unseenChanges: { [UserID]: Path[] },
  owner: { id: UserID, state: OwnerStateValue },
};

/**
 * Field path starting from the root of the object
 * @example
 * // string
 * "legs.0.departureDate"
 * "aircraft.tailNumber"
 * // array
 * ['legs', 0, 'departureDate']
 * ['aircraft', 'tailNumber']
 */
type Path = string | string[];
type UserID = string;

export const TripState = {
  OWNER_DRAFT: 'Owner Draft',
  OWNER_REQUEST: 'Owner Request',
  DRAFT: 'Draft',
  UPCOMING: 'Upcoming',
  ACTIVE: 'Active',
  ENDED: 'Ended',
  CANCELLED: 'Cancelled',
};

export const OwnerState = {
  MANAGER_ACKNOWLEDGED: 'Acknowledged',
  MANAGER_CANCELED: 'Canceled',
  MANAGER_DRAFT: 'Manager Draft',
  MANAGER_REQUESTED: 'Manager Requested',
  MANAGER_UPDATED: 'Updated',
  OWNER_ACCEPTED: 'Accepted',
  OWNER_REJECTED: 'Rejected',
  OWNER_DRAFT: 'Draft',
  OWNER_REQUESTED: 'Requested',
  OWNER_SEEN: 'Seen',
};

export const PilotState = {
  MANAGER_CANCELED: 'Manager Canceled',
  MANAGER_DRAFT: 'Manager Draft',
  MANAGER_REQUESTED: 'Manager Requested',
  MANAGER_UPDATED: 'Updated',
  OWNER_REJECTED: 'Owner Rejected',
  PILOT_ACCEPTED: 'Accepted',
  PILOT_REJECTED: 'Rejected',
  PILOT_SEEN: 'Seen',
};

export const UserRole = {
  PILOT: 'pilot',
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  OWNER: 'owner',
};

export const TripTab = {
  DRAFT: 'Draft',
  REQUESTED: 'Requested',
  UPCOMING: 'Upcoming',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
  ALL: 'All',
};

export type TripStateValue =
  | TripState.OWNER_DRAFT
  | TripState.OWNER_REQUEST
  | TripState.DRAFT
  | TripState.UPCOMING
  | TripState.ACTIVE
  | TripState.ENDED
  | TripState.CANCELLED;

export type OwnerStateValue =
  | OwnerState.MANAGER_ACKNOWLEDGED
  | OwnerState.MANAGER_CANCELED
  | OwnerState.MANAGER_DRAFT
  | OwnerState.MANAGER_REQUESTED
  | OwnerState.MANAGER_UPDATED
  | OwnerState.OWNER_ACCEPTED
  | OwnerState.OWNER_REJECTED
  | OwnerState.OWNER_DRAFT
  | OwnerState.OWNER_REQUESTED
  | OwnerState.OWNER_SEEN;

export type PilotStateValue =
  | PilotState.MANAGER_CANCELED
  | PilotState.MANAGER_DRAFT
  | PilotState.MANAGER_REQUESTED
  | PilotState.MANAGER_UPDATED
  | PilotState.OWNER_REJECTED
  | PilotState.PILOT_ACCEPTED
  | PilotState.PILOT_REJECTED
  | PilotState.PILOT_SEEN;

const tripConverter = {
  toFirestore(trip: Trip): DocumentData {
    /**
     * IMPORTANT
     * `toFirestore` should be able to work with partial data, it would not always receive a full trip
     * derived files like `pilotStates`, `dateDeparting`, `departingFrom` should only be added if the
     * data they are derived from is present
     * This allows us to send just the information that needs to update (delta) and helps with change tracking
     */
    return _.omitBy(
      {
        ...trip,
        aircraft:
          trip.aircraft &&
          _.pick(trip.aircraft, [
            'name',
            'numEngines',
            'tailNumber',
            'type',
            'path',
          ]),
        pilots: trip.pilots?.map(p =>
          _.pick(p, [
            'id',
            'firstName',
            'lastName',
            'phoneNumber',
            'email',
            'state',
          ]),
        ),
        pilotStates: trip.pilots?.map(p => ({ id: p.id, state: p.state })),
        owner: trip.owner
          ? { ...trip.owner, state: trip.owner.state ?? '' }
          : undefined,
        dateUpdated: FieldValue.serverTimestamp(),
        updatedBy: getUid(),
        dateDeparting: _.head(trip.legs)?.departureDate.toJSDate(),
        departingFrom: _.head(trip.legs)?.from,
        // _state fields help us with query ordering
        _state: trip.state && getStateWeight(trip.state),
        _ownerState: trip.owner?.state && getStateWeight(trip.owner.state),
        _pilotState: trip.pilots && getStateWeight(_.head(trip.pilots)?.state),
        legs: trip.legs?.map(leg => ({
          ...leg,
          departureDate: leg.departureDate.toJSDate(),
          departureTz: leg.departureDate.zoneName,
        })),
      },
      // Ignore undefined values or keys that shouldn't be modified
      (value, key) =>
        _.isUndefined(value) || _.includes(['dateCrated', 'path', 'id'], key),
    );
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): Trip {
    const data = snapshot.data(options);
    return {
      ...data,
      path: snapshot.ref.path,
      id: snapshot.ref.id,
      dateCreated: data.dateCreated
        ? DateTime.fromSeconds(data.dateCreated.seconds)
        : DateTime.invalid('missing date'),
      dateUpdated: data.dateUpdated
        ? DateTime.fromSeconds(data.dateUpdated.seconds)
        : DateTime.invalid('missing date'),
      legs: _.map(data.legs, leg => ({
        ...leg,
        departureDate: DateTime.fromSeconds(leg.departureDate.seconds).setZone(
          leg.departureTz,
        ),
      })),
    };
  },
};

export const getStateWeight = state => {
  switch (state) {
    case TripState.OWNER_REQUEST:
    case OwnerState.OWNER_DRAFT:
    case PilotState.MANAGER_DRAFT:
    case OwnerState.MANAGER_UPDATED:
    case PilotState.MANAGER_UPDATED:
      return 1;
    case OwnerState.MANAGER_CANCELED:
    case PilotState.MANAGER_CANCELED:
      return 2;
    case OwnerState.MANAGER_REQUESTED:
    case PilotState.MANAGER_REQUESTED:
      return 3;
    case OwnerState.MANAGER_ACKNOWLEDGED:
      return 4;
    case TripState.UPCOMING:
    case OwnerState.OWNER_REJECTED:
    case PilotState.PILOT_REJECTED:
      return 5;
    case TripState.ACTIVE:
    case OwnerState.OWNER_ACCEPTED:
    case PilotState.PILOT_ACCEPTED:
      return 6;
    case OwnerState.OWNER_REQUESTED:
    case TripState.ENDED:
      return 7;
    case OwnerState.OWNER_SEEN:
    case PilotState.PILOT_SEEN:
    case TripState.CANCELLED:
    case PilotState.OWNER_REJECTED:
      return 8;
    case OwnerState.MANAGER_DRAFT:
      return 9;
    case TripState.DRAFT:
      return 10;
    default:
      return 9999;
  }
};

export default tripConverter;
