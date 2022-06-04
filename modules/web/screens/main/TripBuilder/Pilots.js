/**
 * @format
 * @flow strict-local
 */

import React, { Node, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import styled from '@emotion/native';
import _ from 'lodash';
import { DataTable } from 'react-native-paper';

import Text from '@appComponents/Text';
import { useConfirmation } from '@appComponents/Dialog';
import PilotList, { PilotItem } from '../../../components/PilotList';

type PilotProps = {
  // Ordered by rank - commander, first officer, other officers, etc...
  pilots: PilotItem[],
  changePilots: (PilotItem[]) => void,
  pilotOptions: {
    loading: boolean,
    available: PilotItem[],
    unavailable: PilotItem[],
    unavailableIds: Set<string>,
  },
  aircraft?: { pilots: PilotItem[] },
};

const Pilots = ({
  pilots,
  changePilots,
  pilotOptions,
  aircraft,
}: PilotProps): Node => {
  const { confirm: confirmUnavailable, confirmationNode } = useConfirmation({
    title: 'Schedule Unavailable Pilot',
    message:
      'This pilot is assigned to another trip. Are you sure you want to schedule an unavailable pilot?',
    action: changePilots,
  });

  const options = useMemo(
    () => [
      { label: 'Available', options: pilotOptions.available },
      { label: 'Unavailable', options: pilotOptions.unavailable },
    ],
    [pilotOptions.available, pilotOptions.unavailable],
  );

  const isUnavailable = useCallback(
    pilot => pilotOptions.unavailableIds.has(pilot.id),
    [pilotOptions.unavailableIds],
  );

  return (
    <PilotsLayout>
      <PilotList
        withStatus
        canSetCommander
        selected={pilots}
        options={options}
        canAdd={_.size(aircraft?.pilots) > 0}
        onChange={changePilots}
        isUnavailable={isUnavailable}
        onUnavailableSelected={confirmUnavailable}
        maxEntries={2}
        ListHeaderComponent={
          <ListHeaderLayout>
            <DataTable.Title style={[styles.headerItem, styles.headerItemPIC]}>
              PIC
            </DataTable.Title>
            <DataTable.Title style={[styles.headerItem, styles.headerItemName]}>
              Name
            </DataTable.Title>
            <DataTable.Title style={[styles.headerItem, styles.headerItemEdit]}>
              Edit
            </DataTable.Title>
            <DataTable.Title
              style={[styles.headerItem, styles.headerItemStatus]}>
              Status
            </DataTable.Title>
            <DataTable.Title
              style={[styles.headerItem, styles.headerItemRemove]}>
              Remove
            </DataTable.Title>
          </ListHeaderLayout>
        }
      />
      {!aircraft && <Text>Select an aircraft first</Text>}
      {Boolean(aircraft) && _.isEmpty(aircraft.pilots) && (
        <Text>There are no pilots assigned to the selected aircraft</Text>
      )}
      {confirmationNode}
    </PilotsLayout>
  );
};

const PilotsLayout = styled.View(({ theme }) => ({
  marginHorizontal: 'auto',
  width: 500,
}));

const ListHeaderLayout = styled(DataTable.Header)(({ theme }) => ({
  paddingHorizontal: theme.layout.gap(2),
}));

const styles = StyleSheet.create({
  headerItem: {
    flexGrow: 0,
    flexBasis: 'auto',
  },
  headerItemPIC: {
    width: 32,
  },
  headerItemName: {
    width: 240,
  },
  headerItemEdit: {
    width: 40,
  },
  headerItemStatus: {
    width: 120,
    justifyContent: 'center',
  },
  headerItemRemove: {
    marginLeft: 'auto',
  },
});

export default Pilots;
