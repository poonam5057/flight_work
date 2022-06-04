/**
 * @format
 * @flow strict-local
 */

import React, { Node, useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import _ from 'lodash';
import styled from '@emotion/native';

import Radio from '@appComponents/Radio';
import List, { useGenericListControl } from '@appComponents/List';
import { Spacer } from '@appComponents/ScreenLayout';
import PassengerEdit from './PassengerEdit';
import type { PassengerItem } from './PassengerEdit';

type PassengerListProps = {
  passengers: Array<PassengerItem & { isPendingAdd?: boolean }>,
  onAdd?: PassengerItem => void,
  canAdd?: Boolean,
  onRemove: PassengerItem => void,
  onReplace: ({ prev: PassengerItem, next: PassengerItem }) => void,
  setLead?: PassengerItem => void,
  style?: ViewStyle,
  numColumns?: number,
  ownerId?: String,
};

const MAX_PASSENGERS = 20;

const PassengerList = ({
  passengers = [],
  onReplace,
  setLead,
  onAdd,
  canAdd,
  onRemove,
  style,
  numColumns,
  ownerId,
}: PassengerListProps): Node => {
  const { items, hasPendingAdd, addEntry, removeEntry, removePending } =
    useGenericListControl({ items: passengers, onRemove });

  const keyExtractor = useCallback((item, i) => item.name || i, []);

  const renderItem = useCallback(
    ({ item, index }: PassengerListItem) => (
      <>
        {setLead && (
          <LeadSelector
            value={item.name}
            checked={index === 0}
            onChange={() => !item.isPendingAdd && setLead(item)}
          />
        )}
        <PassengerEdit
          ownerId={ownerId}
          passenger={item}
          selectedPassengers={passengers}
          isLead={index === 0}
          onUpdate={({ isPendingAdd, ...passenger }: PassengerItem) => {
            if (isPendingAdd) {
              removePending();
              onAdd(passenger);
            } else {
              onReplace({ prev: item, next: passenger });
            }
          }}
          autoFocus={Boolean(onAdd)}
        />
      </>
    ),
    [onAdd, onReplace, ownerId, passengers, removePending, setLead],
  );

  return (
    <List
      items={items}
      onRemove={removeEntry}
      onAdd={addEntry}
      canAdd={canAdd}
      disableAdd={hasPendingAdd}
      addButtonLabel="Add Passenger"
      renderItem={renderItem}
      maxItems={MAX_PASSENGERS}
      style={style}
      numColumns={numColumns}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
};

type PassengerListItem = { item: PassengerItem, index: number };

export const usePassengerListControl = ({ legs = [], changePassengers }) => {
  const addPassenger = useCallback(
    (passenger, legIndex = 0) => {
      getAffectedLegs(legs, legIndex).forEach(leg => {
        changePassengers(leg, [...leg.passengers, passenger]);
      });
    },
    [changePassengers, legs],
  );

  const removePassenger = useCallback(
    (passenger, legIndex = 0) =>
      getAffectedLegs(legs, legIndex).forEach(leg => {
        changePassengers(
          leg,
          leg.passengers.filter(({ name }) => name !== passenger.name),
        );
      }),
    [changePassengers, legs],
  );

  const replacePassenger = useCallback(
    ({ prev, next }) =>
      legs.forEach(leg =>
        changePassengers(
          leg,
          leg.passengers.map(p => {
            if (p.name === prev.name) {
              return next;
            }

            return p;
          }),
        ),
      ),
    [changePassengers, legs],
  );

  const allPassengers = useMemo(
    () => _.chain(legs).map('passengers').flatten().uniqBy('name').value(),
    [legs],
  );

  return {
    addPassenger,
    removePassenger,
    replacePassenger,
    allPassengers,
  };
};

const getAffectedLegs = (legs, legIndex = 0) => legs.slice(legIndex);

const ItemSeparator = () => <Spacer size={0} />;

const LeadSelector: Radio = styled(Radio)({
  paddingHorizontal: 0,
  paddingVertical: 0,
});

export default PassengerList;
