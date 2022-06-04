/**
 * @format
 * @flow strict-local
 */

import React, { Node, useCallback, useEffect } from 'react';
import styled from '@emotion/native';
import _ from 'lodash';
import { DateTime } from 'luxon';
import List, { RemoveButton } from '@appComponents/List';

import LegEdit from '../../../components/LegEdit';
import type { LegItem } from '../../../components/LegEdit';

type TripInfoProps = {
  legs: Array<LegItem>,
  onChange: (Array<LegItem>) => void,
};

const MAX_LEGS = 7;

const TripLegs = ({ legs = [], onChange }: TripInfoProps): Node => {
  const addNewLeg = useCallback(() => {
    onChange([
      ...legs,
      {
        from: legs.slice().pop()?.to ?? '',
        to: '',
        departureDate:
          legs[legs.length - 1]?.departureDate ??
          DateTime.now().startOf('minute'),
        passengers: legs.slice().pop()?.passengers.slice() ?? [],
        id: Date.now(),
      },
    ]);
  }, [legs, onChange]);

  const onRemove = useCallback(
    ({ index }) => onChange(legs.filter((entry, i) => i !== index)),
    [legs, onChange],
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <LegEdit
        index={index}
        leg={item}
        prevDeparture={legs[index - 1]?.departureDate}
        autoTimezone={isIncomplete(item)}
        onChange={updates =>
          onChange(
            legs.map((entry, i) => {
              if (i === index) {
                return { ...entry, ...updates };
              }

              return entry;
            }),
          )
        }
        onSubmit={() => !isIncomplete(item) && addNewLeg()}
      />
    ),
    [addNewLeg, legs, onChange],
  );

  const canRemove = useCallback(() => legs.length > 1, [legs.length]);

  const disableAdd = legs.length > 0 && isIncomplete(_.last(legs));

  useEffect(() => {
    if (legs.length === 0) {
      addNewLeg();
    }
  }, [addNewLeg, legs.length]);

  return (
    <LegsList
      items={legs}
      onRemove={onRemove}
      onAdd={addNewLeg}
      addButtonLabel="Add leg"
      disableAdd={disableAdd}
      canRemove={canRemove}
      renderItem={renderItem}
      maxItems={MAX_LEGS}
      rowAlign="flex-end"
      RemoveButtonComponent={StyledRemoveButton}
    />
  );
};

const isIncomplete = leg =>
  _.size(leg?.from) < 2 || _.size(leg?.to) < 2 || _.isEmpty(leg?.departureDate);

const LegsList: typeof List = styled(List)(({ theme }) => ({
  width: '100%',
}));

const StyledRemoveButton = styled(RemoveButton)(({ theme }) => ({
  marginLeft: 0,
  width: 42,
  height: 42,
}));

export default TripLegs;
