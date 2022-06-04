/**
 * List component for pilots suitable for adding pilots to a trip or an aircraft
 *
 * @format
 * @flow strict-local
 */

import React, { Node, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import styled from '@emotion/native';
import _ from 'lodash';

import List, { useGenericListControl } from '@appComponents/List';
import Radio from '@appComponents/Radio';
import { PilotState } from '@appUtils/tripConverter';
import type { PilotStateValue } from '@appUtils/tripConverter';
import PersonEdit from './PersonEdit';
import StatusWrap from './StatusChip';

type PilotListProps = {
  selected: Array<PilotItem & { isPendingAdd?: boolean }>,
  options:
    | Array<PilotItem>
    | Array<{ label: string, options: Array<PilotItem> }>,
  onChange: (Array<PilotItem>) => void,
  isUnavailable?: PilotItem => boolean,
  onUnavailableSelected?: (Array<PilotItem>) => void,
  canSetCommander?: Boolean,
  canAdd?: Boolean,
  style?: ViewStyle,
  maxEntries?: number,
  ListHeaderComponent?: Node,
  withStatus?: boolean,
  numColumns?: number,
};

export type PilotItem = {
  id: string,
  firstName: string,
  lastName: string,
  state?: PilotStateValue,
};

const PilotList = ({
  selected = [],
  options,
  isUnavailable = () => false,
  onChange,
  onUnavailableSelected,
  canSetCommander,
  canAdd = true,
  style,
  maxEntries = 10,
  ListHeaderComponent,
  withStatus = false,
  numColumns = 1,
}: PilotListProps): Node => {
  const add = useCallback(
    pilot =>
      isUnavailable(pilot)
        ? onUnavailableSelected([...selected, pilot])
        : onChange([...selected, pilot]),
    [isUnavailable, onChange, onUnavailableSelected, selected],
  );

  const replace = useCallback(
    ({ prev, next }) => {
      const nextState = selected.map(p => (p.id === prev.id ? next : p));
      return isUnavailable(next)
        ? onUnavailableSelected(nextState)
        : onChange(nextState);
    },
    [isUnavailable, onChange, onUnavailableSelected, selected],
  );

  const onRemove = useCallback(
    pilot => onChange(selected.filter(({ id }) => id !== pilot.id)),
    [onChange, selected],
  );

  const { items, hasPendingAdd, addEntry, removeEntry, removePending } =
    useGenericListControl({ items: selected, onRemove });

  const renderItem = useCallback(
    ({ item }: PilotListItem) => (
      <>
        {canSetCommander && (
          <LeadSelector
            value={item.name}
            checked={item.id === _.head(selected)?.id}
            onChange={() =>
              !item.isPendingAdd &&
              onChange([item, ...selected.filter(({ id }) => id !== item.id)])
            }
          />
        )}
        <PersonEdit
          person={item}
          unavailablePeople={selected}
          people={options}
          onChange={(pilot: PilotItem) => {
            if (item.isPendingAdd) {
              removePending();
              add(pilot);
            } else {
              replace({ prev: item, next: pilot });
            }
          }}
          autoFocus={canAdd}
          canCreateNewEntries={false}
          style={{ maxWidth: undefined }}
        />
        {withStatus && <Status item={item} />}
      </>
    ),
    [
      canSetCommander,
      selected,
      options,
      canAdd,
      withStatus,
      onChange,
      removePending,
      add,
      replace,
    ],
  );

  return (
    <List
      items={items}
      onRemove={removeEntry}
      onAdd={addEntry}
      canAdd={canAdd}
      disableAdd={hasPendingAdd}
      addButtonLabel="Add Pilot"
      renderItem={renderItem}
      maxItems={maxEntries}
      style={style}
      ListHeaderComponent={ListHeaderComponent}
      rowJustify="space-between"
      numColumns={numColumns}
    />
  );
};

type PilotListItem = { item: PilotItem, index: number };

const Status = ({ item }) => (
  <StatusChip
    status={item.state || PilotState.MANAGER_DRAFT}
    mapStatusToColor={mapStatusToColor}
  />
);

const mapStatusToColor = theme => ({
  [PilotState.MANAGER_UPDATED]: theme.colors.updated,
  [PilotState.MANAGER_CANCELED]: theme.colors.error,
  [PilotState.PILOT_REJECTED]: theme.colors.error,
  [PilotState.PILOT_ACCEPTED]: theme.colors.accepted,
});

const LeadSelector: Radio = styled(Radio)({
  paddingHorizontal: 0,
  paddingVertical: 0,
});

const StatusChip: typeof StatusWrap = styled(StatusWrap)(({ theme }) => ({
  marginLeft: theme.layout.gap(4),
  marginRight: theme.layout.gap(2),
  width: 120,
}));

export default PilotList;
