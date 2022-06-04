/**
 * @file
 * Main trips table
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/native';
import { DateTime } from 'luxon';
import _ from 'lodash';
import { useAsyncCallback } from 'react-async-hook';
import { ActivityIndicator } from 'react-native-paper';

import app, { FirestoreError } from '@appFirebase';
import * as Manager from '@appUtils/manager';
import DataTable, { Row, Cell, PlainCell } from '@appComponents/DataTable';
import {
  PilotState,
  TripState,
  Trip,
  OwnerState,
} from '@appUtils/tripConverter';
import Button, { LinkButton } from '@appComponents/Button';
import { Menu, MenuItem, useMenuState } from '@appComponents/Menu';
import Text from '@appComponents/Text';
import { Box, Circle, ScreenLoader } from '@appComponents/ScreenLayout';
import Checkbox from '@appComponents/Checkbox';
import { SquawkLegend } from './SquawkLegend';

type TripTableProps = {
  loading?: boolean,
  data?: Array<Trip>,
  error?: FirestoreError,
  initialSort?: { key: string, dir: 'asc' | 'desc' },
  onSortChange?: ({ key: string, dir: 'asc' | 'desc' }) => void,
  bulkActions?: boolean,
  statusCol?: boolean,
  highlightRequests?: boolean,
};

const TripsTable = (props: TripTableProps): Node => {
  let emptyMessage = <Text>No Trips Available</Text>;

  if (props.loading && _.isEmpty(props.data)) {
    emptyMessage = <Text>Loading...</Text>;
  }
  if (props.error) {
    emptyMessage = <Text>Failed to load Trip. Try again later</Text>;
  }

  const [checked, setChecked] = useState([]);

  const RowRenderer = useRowRenderer({
    highlightRequests: props.highlightRequests,
    checked,
  });

  return (
    <Box flex={1}>
      {props.loading && <ScreenLoader />}
      <Legend
        selectionMode={props.bulkActions}
        checked={checked}
        loading={props.loading}
        setChecked={setChecked}
        all={props.data}
      />
      <TableLayout
        data={props.data}
        RowComponent={RowRenderer}
        keyExtractor={keyExtractor}
        initialSort={props.initialSort}
        onSortChange={props.onSortChange}
        footerMessage={
          props.loading && _.size(props.data) > 0 && <ActivityIndicator />
        }
        emptyMessage={
          <Box ai="center" mt={1}>
            {emptyMessage}
          </Box>
        }>
        {props.bulkActions && (
          <CheckboxCell
            name="check"
            flex={4}
            setChecked={setChecked}
            alreadyChecked={checked}
          />
        )}
        {props.statusCol && <StateCell title="State" flex={13} sortable />}
        <IdCell title="ID" flex={7} sortable />
        <PlainCell title="Name" path="customName" flex={15} sortable />
        <TailCell title="Tail #" flex={7} sortable />
        <LegsCell title="Legs" flex={8} sortable />
        <DepartureCell title="Departure" col="departure" flex={13} sortable />
        <PilotCell title="Pilot Status" flex={12} sortable />
        <PlainCell title="Owner Status" path="owner.state" flex={10} sortable />
        <ActionsCell
          name="actions"
          numeric
          flex={3}
          icon="more-dots"
          setChecked={setChecked}
        />
      </TableLayout>
    </Box>
  );
};

const useRowRenderer = ({ highlightRequests = true, checked }) =>
  useCallback(
    ({ item, children }) => {
      let bg;
      if (highlightRequests && item.state === TripState.OWNER_REQUEST) {
        bg = '#E0E4E4';
      }

      if (_.includes(checked, item.path)) {
        bg = '#DAEFFC';
      }

      return <RowLayout bg={bg}>{children}</RowLayout>;
    },
    [checked, highlightRequests],
  );

const keyExtractor = trip => trip.path;

const Legend = ({ checked, selectionMode, all, loading, setChecked }) => {
  const { open, action, ...bulkActions } = useStateActions(checked, setChecked);

  const checkbox = selectionMode ? (
    <Checkbox
      label="Select All"
      disabled={loading || _.isEmpty(all)}
      checked={_.size(all) > 0 && _.size(checked) === _.size(all)}
      onChange={() => setChecked(current => (_.isEmpty(current) ? all : []))}
    />
  ) : null;

  return (
    <SquawkLegend
      checked={checked}
      checkbox={checkbox}
      bulkActions={bulkActions}
      action={action}
      actions={
        /*Rendered bulk actions are based on the first checked trip (state)*/
        <Actions trip={_.head(checked)} action={action} {...bulkActions} />
      }
      open={open}
    />
  );
};

const CheckboxCell = ({ item: trip, flex, alreadyChecked, setChecked }) => {
  const checked = _.some(alreadyChecked, t => trip.identifier === t.identifier);

  return (
    <Cell flex={flex}>
      <Checkbox
        label=""
        checked={checked}
        onChange={() => {
          if (checked) {
            setChecked(
              alreadyChecked.filter(t => t.identifier !== trip.identifier),
            );
          } else {
            setChecked([...alreadyChecked, trip]);
          }
        }}
      />
    </Cell>
  );
};

const StateCell = React.memo(
  ({ item: trip, flex }) => (
    <Cell flex={flex}>
      <StatusBadge>
        <Text size="smallest">{trip.state?.toUpperCase()}</Text>
      </StatusBadge>
    </Cell>
  ),
  (a, b) => a.item.state === b.item.state,
);

const IdCell = React.memo(
  ({ item: trip, ...cellProps }) => {
    const labelStyle = { marginHorizontal: 0 };
    let toScreen = 'Trip';
    let screenTitle = trip.identifier;

    return (
      <Cell {...cellProps}>
        <LinkButton
          toScreen={toScreen}
          params={{
            documentPath: trip.path,
            title: screenTitle,
          }}
          mode="text"
          labelStyle={labelStyle}>
          {trip.identifier}
        </LinkButton>
      </Cell>
    );
  },
  (a, b) => a.item.identifier === b.item.identifier,
);

const TailCell = React.memo(
  ({ item: trip, ...cellProps }) => {
    const tail = trip.aircraft?.tailNumber;

    return (
      <Cell {...cellProps}>
        {tail && <Circle color="#7CB518" size={10} />} {tail || '-'}
      </Cell>
    );
  },
  (a, b) => _.isEqualWith(a, b, 'item.aircraft.tailNumber'),
);

const LegsCell = React.memo(
  ({ item: trip, ...cellProps }) => {
    const legs = trip.legs ?? [];
    const from = _.head(legs)?.from ?? '?';
    const to = _.last(legs)?.to ?? '?';

    return (
      <Cell {...cellProps}>
        {from} > {to}
      </Cell>
    );
  },
  (a, b) => _.isEqualWith(a, b, 'item.legs'),
);

const DepartureCell = React.memo(
  ({ item: trip, ...cellProps }) => {
    const departureDate = _.head(trip.legs)?.departureDate;
    if (!departureDate) {
      return <Cell {...cellProps}>-</Cell>;
    }

    const date = departureDate.toLocaleString(DateTime.DATE_SHORT);
    const time = departureDate.toLocaleString(DateTime.TIME_WITH_SHORT_OFFSET);

    return <Cell {...cellProps}>{[date, time].join('\n@')}</Cell>;
  },
  (a, b) => _.isEqualWith(a, b, 'item.legs.0.departureDate'),
);

const PilotCell = React.memo(
  ({ item: trip, ...cellProps }) => {
    if (_.isEmpty(trip.pilots)) {
      return <Cell {...cellProps}>-</Cell>;
    }

    const content = trip.pilots
      .map(
        (p, i) => `(${i === 0 ? 'P' : 'S'}IC) ${p.state || PilotState.UNSENT}`,
      )
      .join('\n');

    return <Cell {...cellProps}>{content}</Cell>;
  },
  (a, b) => _.isEqualWith(a, b, 'item.pilots'),
);

const ActionsCell = React.memo(
  ({ item: trip, checked, label, icon, setChecked, ...cellProps }) => {
    const { action, open, ...menu } = useStateActions([trip], setChecked);

    return (
      <Cell ref={menu.anchorEl} {...cellProps}>
        <Button
          label={label}
          loading={action.loading}
          mode="text"
          icon={icon}
          onPress={open}
        />
        <Actions trip={trip} action={action} {...menu} />
      </Cell>
    );
  },
  (a, b) => a.item.state === b.item.state,
);

const Actions = ({ anchorEl, isOpen, close, action, trip }) => (
  <Menu anchor={anchorEl} visible={isOpen} onDismiss={close}>
    {getActionsForState(trip).map(entry => (
      <ActionItem key={entry.title} action={action} {...entry} />
    ))}
  </Menu>
);

const getActionsForState = (trip: Trip) => {
  if (trip.archived) {
    return [
      { nextState: 'Delete', title: 'Delete' },
      { nextState: 'Restore', title: 'Unarchive' },
    ];
  }

  const map = new Map([
    [
      TripState.OWNER_REQUEST,
      [
        { nextState: TripState.DRAFT, title: 'Acknowledge' },
        { nextState: TripState.CANCELLED, title: 'Reject' },
      ],
    ],
    [
      TripState.DRAFT,
      [
        { nextState: TripState.UPCOMING, title: 'Move to Upcoming' },
        { nextState: TripState.CANCELLED, title: 'Cancel' },
      ],
    ],
    [
      TripState.UPCOMING,
      [
        { nextState: TripState.ACTIVE, title: 'Move to Active' },
        { nextState: TripState.DRAFT, title: 'Move to Draft' },
        { nextState: TripState.CANCELLED, title: 'Cancel' },
      ],
    ],
    [
      TripState.ACTIVE,
      [
        { nextState: TripState.ENDED, title: 'Move to Completed' },
        { nextState: TripState.UPCOMING, title: 'Move to Upcoming' },
        { nextState: TripState.CANCELLED, title: 'Cancel' },
      ],
    ],
    [
      TripState.ENDED,
      [
        { nextState: TripState.ACTIVE, title: 'Move to Active' },
        { nextState: 'Archive', title: 'Archive' },
      ],
    ],
    [
      TripState.CANCELLED,
      [
        { nextState: 'Archive', title: 'Archive' },
        { nextState: 'Delete', title: 'Delete' },
        { nextState: TripState.DRAFT, title: 'Move to Draft' },
      ],
    ],
  ]);

  return map.get(trip.state) || [];
};

const useStateActions = (trips: Trip[], setChecked) => {
  const { close, ...menu } = useMenuState();
  const action = useAsyncCallback(async nextState => {
    const batch = app.firestore().batch();
    _.uniq<Trip>(trips).map(trip => {
      const doc = app.firestore().doc(trip.path);
      let updates = Manager.getPayload({ state: nextState }, trip);

      // Handle special case actions then regular state transitions
      if (nextState === 'Delete') {
        batch.delete(doc);
        setChecked([]);
        return;
      } else if (nextState === 'Archive') {
        updates = Manager.getPayload({ archived: true }, trip);
      } else if (nextState === 'Restore') {
        updates = Manager.getPayload({ archived: false }, trip);
      } else if (nextState === TripState.CANCELLED) {
        if (trip.owner) {
          updates.owner = {
            ...trip.owner,
            state: OwnerState.MANAGER_CANCELED,
          };
        }

        updates.pilots = _.map(trip.pilots, pilot => ({
          ...pilot,
          state: PilotState.MANAGER_CANCELED,
        }));
      } else if (nextState === TripState.ENDED) {
        const location = _.last(trip.legs)?.to;
        if (trip.aircraft?.path && location) {
          const aircraftDoc = app.firestore().doc(trip.aircraft.path);
          batch.update(aircraftDoc, { location });
        }
      } else if (nextState === TripState.DRAFT) {
        updates.owner = {
          ...trip.owner,
          state: OwnerState.MANAGER_ACKNOWLEDGED,
        };
      } else if (nextState === TripState.UPCOMING) {
        updates.owner = {
          ...trip.owner,
          state: OwnerState.MANAGER_UPDATED,
        };

        updates.pilots = _.map(trip.pilots, pilot => ({
          ...pilot,
          state: PilotState.MANAGER_UPDATED,
        }));
      }

      batch.update(doc, updates);
      setChecked([]);
    });

    close();
    return batch.commit();
  });

  return { action, close, ...menu };
};

const ActionItem = ({ title, action, nextState }) => {
  return (
    <MenuItem
      title={title}
      onPress={() => action.execute(nextState)}
      disabled={action.loading}
    />
  );
};

const TableLayout: DataTable = styled(DataTable)(({ theme }) => ({
  flex: 1,
  marginBottom: theme.layout.space(0.5),
}));

const RowLayout: Row = styled(Row)(({ theme, bg = 'background' }) => ({
  minHeight: 56,
  backgroundColor: _.get(theme.colors, bg, bg),
}));

const StatusBadge = styled.View(({ theme }) => ({
  borderRadius: 100,
  paddingVertical: theme.layout.space(0.375),
  paddingHorizontal: theme.layout.space(1),
  borderWidth: 1,
  borderColor: theme.colors.text,
}));

export default TripsTable;
