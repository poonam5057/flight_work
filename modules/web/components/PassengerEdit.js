/**
 * @file
 * A component for adding or editing a passenger
 *
 * @format
 * @flow strict-local
 */

import React, { useMemo, useRef } from 'react';
import { ViewStyle } from 'react-native';
import { useAsyncCallback } from 'react-async-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';

import type { ActionMeta } from '@appComponents/SearchField';
import PersonEdit from './PersonEdit';
import { getUserData } from '@appUtils/api';

type PassengerProps = {
  passenger: PassengerItem,
  onUpdate: PassengerItem => void,
  isLead?: boolean,
  style?: ViewStyle,
  autoFocus?: boolean,
  selectedPassengers?: PassengerItem[],
  ownerId?: String,
};

export type PassengerItem = {
  name: string,
};

const PassengerEdit = ({
  passenger,
  onUpdate,
  isLead,
  style,
  autoFocus = true,
  selectedPassengers = [],
  ownerId,
}: PassengerProps) => {
  const controller = useRef();

  const options = useOptions(ownerId);

  const changeCallback = useChangeCallback({
    controller,
    options,
    passenger,
    onUpdate,
  });

  return (
    <PersonEdit
      person={passenger}
      onChange={changeCallback.execute}
      people={options.list}
      unavailablePeople={selectedPassengers}
      autoFocus={autoFocus}
      style={style}
      loading={options.loading}
      onMenuOpen={options.fetch}
      onMenuClose={passenger.name ? controller.current?.toggleEdit : undefined}
      controllerRef={controller}
      renderName={person =>
        person.name ? `${person.name} ${isLead ? ' (Lead)' : ''}` : ''
      }
    />
  );
};

/*
 * Todo: provide contextual information for the following
 * - Current Owner's default passenger list
 * - A function to add passengers to the Owner's default list
 * Or we can add passengers to the default list after the trip is approved
 */

// Todo: hook with backend
/**
 * Create new passenger record for the current owner in the DB
 * @param passenger
 */
const createPassenger = (passenger: PassengerItem) => {
  return passenger;
};

// Todo: hook with backend
/**
 * Add this passenger to the top of our recent passengers list
 * @param passenger
 * @returns {Promise<void>}
 */
const updateRecentlyUsed = async ({ name }) => {
  const storedData = await AsyncStorage.getItem('recent-passengers');
  let payload = [{ name }];

  if (storedData) {
    const storedList = JSON.parse(storedData);
    payload = storedList.filter(p => p.name !== name);
    payload.unshift({ name });
  }

  return AsyncStorage.setItem(
    'recent-passengers',
    JSON.stringify(payload.slice(0, 100)),
  );
};

const useChangeCallback = ({ controller, passenger, onUpdate, options }) =>
  useAsyncCallback(
    async (
      item: { label?: string } | PassengerItem,
      actionMeta: ActionMeta,
    ) => {
      controller.current.setEditMode(false);

      let updates;

      if (actionMeta.action === 'create-option') {
        updates = createPassenger({ ...passenger, name: item.label });
      } else if (actionMeta.action === 'select-option') {
        updates = { ...passenger, ...item };
      }

      if (updates) {
        onUpdate(updates);
        await options.updateDefault(updates);
      }
    },
    [onUpdate, passenger],
  );

const useOptions = ownerId => {
  const fetchedOptions = useOwnerPassengers(ownerId);
  const defaultOptions = useRecentPassengers();

  const list = useMemo(() => {
    const defaults = defaultOptions.result ?? [];
    const all = fetchedOptions.result ?? [];

    return [
      {
        label: 'Recently Used',
        options: defaults,
      },
      {
        label: 'Other',
        options: _.differenceBy(all, defaults, 'name'),
      },
    ];
  }, [defaultOptions.result, fetchedOptions.result]);

  return {
    list,
    loading: fetchedOptions.loading || defaultOptions.loading,
    called: fetchedOptions.status !== 'not-requested',
    fetch() {
      Promise.all([fetchedOptions.execute(), defaultOptions.execute()]).catch(
        console.error,
      );
    },
    async updateDefault(updates) {
      await updateRecentlyUsed(updates);
      defaultOptions.reset();
      await defaultOptions.execute();
    },
    exists(name) {
      return _.chain(list)
        .flatten()
        .some(p => name === p.name)
        .value();
    },
  };
};

// Todo: hook with backend logic
const useRecentPassengers = () => {
  return useAsyncCallback(async () => {
    const storedData = await AsyncStorage.getItem('recent-passengers');
    if (storedData) {
      return JSON.parse(storedData);
    }

    return [];
  }, []);
};

const useOwnerPassengers = uid => {
  return useAsyncCallback(async () => {
    const ownerData = await getUserData(uid);
    if (ownerData?.passengers) {
      return ownerData.passengers;
    }
    return [];
  });
};

export default PassengerEdit;
