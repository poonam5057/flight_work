/**
 * @file
 * Observable model for a single trip data.
 * It reacts on data updates and triggers re-renders in observer components as necessary
 */

import { HAS_APU, METERING_SYSTEM, STORAGE_FOLDERS } from '@flightsheet/constants';
import { fromTimestamp, prepareForBackend } from '@flightsheet/utils';
import { action, computed, observable } from 'mobx';
import * as R from 'ramda';

import { FieldValue } from '../dbConfig';
import crashlytics from '../utils/crashlyticsDecorator';
import { deleteImages, updateImages } from '../utils/file';
import { removeReactivity, stripUndefined } from '../utils/object';

class TripModel {
  /**
   * @param {object} params
   * @param {FirebaseFirestoreTypes.DocumentReference} params.doc
   * @param {FirebaseStorageTypes.Reference} params.storage
   * @param {object} [params.data]
   * @param {object} [params.meta]
   */
  constructor ({ doc, storage, data, meta }) {
    if (!doc || !storage) throw new Error('Missing required constructor parameters');

    this.doc = doc;
    this.storage = storage;
    this.data = data || {};
    this.metadata = meta || {};
    this.id = this.doc.id;
  }

  @observable data = {};
  @observable metadata = {};
  @observable tripId = null;
  @observable isSelected = false;

  @computed get isNew() { return !this.tripId; }

  @computed get isArchived() { return this.data.archived; }

  @computed get title () {
    if (this.isNew) return 'New Trip';

    const { customName } = this.data.info;
    return customName || this.tripId;
  }

  @computed get isSaved () {
    return !this.metadata.hasPendingWrites;
  }

  @computed get totalExpenses () {
    return this.expenses.reduce((acc, cur) => acc + parseFloat(cur.cost), 0);
  }

  @computed get expenses () {
    const { expenses = [] } = this.data;
    return sortByDate(expenses);
  }

  @computed get postFlightList () {
    const postFlight = this.data.postFlight;
    return postFlight?.slice ? postFlight.slice() : [];
  }

  @computed get squawkBox () {
    const { squawkBox = [] } = this.data;
    return squawkBox.slice();
  }

  @computed get info () {
    if (!this.data.info) {
      return null;
    }

    let { dateBegin, dateEnd, ...rest } = this.data.info;

    dateBegin = fromTimestamp(dateBegin);
    dateEnd = fromTimestamp(dateEnd);

    return {
      ...rest,
      dateBegin,
      dateEnd,
    };
  }

  @computed get aircraft () {
    const existingData = this.data.aircraft || {};
    const {
      numEngines = 1,
      meteringSystem = METERING_SYSTEM.Hobbs,
      hasAPU = HAS_APU.No,
      apuMeteringSystem = METERING_SYSTEM.Hobbs,
      trendMonitoring,
      ...rest
    } = existingData;

    const output = {
      meteringSystem,
      numEngines,
      hasAPU,
      apuMeteringSystem,
      ...rest,
    };

    const no = R.either(R.isEmpty, R.isNil);

    if (no(trendMonitoring) || no(trendMonitoring.engines)) {
      return output;
    }

    const roundedEngines = R.map(engine => {
      if (no(engine)) {
        return engine;
      }

      const out = {
        ...engine,
      };

      if (engine.itt) {
        out.itt = Math.round(engine.itt);
      }

      return out;
    }, trendMonitoring.engines);

    const roundedTrendMonitoring = {
      engines: roundedEngines,
    };

    output.trendMonitoring = R.mergeRight(trendMonitoring, roundedTrendMonitoring);
    return output;
  }

  @computed get passengers() {
    const { passengers = [] } = this.data;
    const [leadPassenger, rest] = R.partition(R.propEq('isLead', true), passengers);

    return [
      ...leadPassenger,
      ...sortByFirstName(rest),
    ];
  }

  @computed get leadPassenger() {
    return this.passengers[0];
  }

  @computed get legs() {
    const { legs = [] } = this.data;
    return sortByDate(legs);
  }

  @computed get images() {
    const images = [...this.expenses, ...this.squawkBox]
      .flatMap(({ photos }) => photos)
      .filter(photo => photo);

    return images;
  }

  @action
  @crashlytics('archived')
  setArchived(archived) {
   this.data.archived = archived;
   this.updateData();
  }

  @action
  @crashlytics('data')
  updatePostFlightData (data) {
    this.data.postFlight = removeReactivity(data);
    this.updateData();
  }

  @action
  @crashlytics('data', 'aircraft')
  updateTripInfo (data, aircraft) {
    let { dateBegin, dateEnd, ...rest } = data;

    dateBegin = prepareForBackend(dateBegin);
    dateEnd = prepareForBackend(dateEnd);

    const info = {
      ...this.info,
      ...rest,
      dateBegin,
      dateEnd,
    };

    this.data.info = info;

    if (aircraft) {
      const aircraftInfo = this.data.aircraft || {};

      const {
        numEngines = aircraftInfo.numEngines,
        meteringSystem = aircraftInfo.meteringSystem,
        hasAPU = aircraftInfo.hasAPU,
        apuMeteringSystem = aircraftInfo.apuMeteringSystem,
      } = aircraft;

      this.data.aircraft = {
        ...aircraftInfo,
        numEngines,
        meteringSystem,
        hasAPU,
        apuMeteringSystem,
      };
    }

    this.updateData();

  }

  @action
  @crashlytics('data')
  updateAircraftInfo (data) {
    const excludingUndefined = stripUndefined(data);
    if (excludingUndefined.flightTimes) {
      excludingUndefined.flightTimes.airFrameBegin = data.flightTimes.airFrameBegin || null;
      excludingUndefined.flightTimes.beginNumLandings = data.flightTimes.beginNumLandings || null;
    }

    const aircraft = {
      ...this.aircraft,
      ...excludingUndefined,
    };

    this.data.aircraft = aircraft;
    this.updateData();
  }
  /**
   * Creates or updates a leg
   * @param {object} updated
   * @param {object} originalLeg - used for referential equality
   */
  @action
  @crashlytics('updated', 'originalLeg')
  editLeg(updated, originalLeg) {
    const index = this.legs.indexOf(originalLeg);
    const legs = this.legs.slice();

    const updatedLeg = { ...updated, date: prepareForBackend(updated.date) };

    if (originalLeg) legs[index] = updatedLeg;
    else legs.push(updatedLeg);

    this.data.legs = legs;
    this.updateData();
  }

  /**
   * Creates or updates a squawk
   * @param {object} updated
   * @param {object} originalSquawk - used for referential equality
   */
  @action
  @crashlytics('updated', 'originalSquawk')
  async editSquawk(updated, originalSquawk) {
    const index = this.squawkBox.indexOf(originalSquawk);
    const squawkBox = this.squawkBox.slice();

    updated = removeReactivity(updated);
    updated.photos = await updateImages(updated.photos, originalSquawk?.photos, this.storage.child(STORAGE_FOLDERS.SQUAWK_BOX));

    if (originalSquawk) squawkBox[index] = updated;
    else squawkBox.push(updated);

    this.data.squawkBox = squawkBox;
    this.updateData();
  }

  /**
   * Creates or updates a passenger
   * @param {{ firstName, lastName, isLead }} updated
   * @param {object} originalPassenger
   */
  @action
  @crashlytics('updated', 'originalPassenger')
  editPassenger(updated, originalPassenger) {
    const index = this.passengers.indexOf(originalPassenger);
    let passengers = this.passengers.slice();

    if (updated.isLead) passengers = passengers.map(p => ({...p, isLead: false }));
    if (originalPassenger) passengers[index] = updated;
    else passengers.push(updated);

    this.data.passengers = passengers;
    this.updateData();
  }
 /**
  * Creates or updates an expense
  * @param {object} updated
  * @param {object} originalExpense - used for referential equality
  */
  @action
  @crashlytics('updated', 'originalExpense')
  async editExpense(updated, originalExpense) {
    const index = this.expenses.indexOf(originalExpense);
    const expenses = this.expenses.slice();

    updated = removeReactivity(updated);
    updated.photos = await updateImages(updated.photos, originalExpense?.photos, this.storage.child(STORAGE_FOLDERS.EXPENSES));

    if (originalExpense) expenses[index] = updated;
    else expenses.push(updated);

    this.data.expenses = expenses;
    this.updateData();
  }
  /**
   * Deletes a passenger
   * @param {object} passenger - used for referential equality
   */
  @action
  @crashlytics('passenger')
  deletePassenger(passenger) {
    const updatedList = this.passengers.filter(p => p !== passenger);

    if (updatedList.length && passenger.isLead) updatedList[0].isLead = true;
    this.data.passengers = updatedList;
    this.updateData();
  }
  /**
   * Deletes a Leg
   * @param {object} leg - used for referential equality
   */
  @action
  @crashlytics('leg')
  deleteLeg(leg) {
    const updatedList = this.data.legs.filter(l => l !== leg);
    this.data.legs = updatedList;

    this.updateData();
  }

  /**
   * Deletes a Squawk
   * @param {object} squawk - used for referential equality
   */
  @action
  @crashlytics('squawk')
  deleteSquawk(squawk) {
    const updatedList = this.data.squawkBox.filter(s => s !== squawk);
    this.data.squawkBox = updatedList;

    deleteImages(squawk.photos, this.storage.child(STORAGE_FOLDERS.SQUAWK_BOX)).catch(console.warn);

    this.updateData();
  }

  /**
   * Deletes an expense
   * @param {object} expense - used for referential equality
   */
  @action
  @crashlytics('expense')
  deleteExpense(expense) {
    const updatedList = this.data.expenses.filter(e => e !== expense);
    this.data.expenses = updatedList;

    if (expense?.photos?.length) deleteImages(expense.photos, this.storage.child(STORAGE_FOLDERS.EXPENSES)).catch(console.warn);

    this.updateData();
  }

  /**
   * Call this to commit current changes to the backend
   * @param {object} [newData] - any overrides to data
   */
  @action
  updateData (newData = {}) {
    const { dateCreated = FieldValue.serverTimestamp(), archived = false, ...rest } = this.data;
    // Todo: improvement - sometimes, because there are no other changes, the only change sent is the `dateUpdated`
    const dateUpdated = FieldValue.serverTimestamp();

    const payload = {
      ...rest,
      dateCreated,
      dateUpdated,
      archived,
      ...newData,
    };

    this.data = payload;

    this.doc.set(payload, { merge: true })
      .catch(crashlytics.logError);
  }
}

const sortByFirstName = R.sortBy(R.prop('firstName'));
const sortByDate = R.sortBy(R.prop('date'));

export default TripModel;

