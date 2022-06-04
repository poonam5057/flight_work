/**
 * @format
 * @flow strict-local
 */

import React, { Node, useState } from 'react';
import { IconButton, List, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import styled from '@emotion/native';
import { DateTime } from 'luxon';
import _ from 'lodash';

import {
  Box,
  ScreenLoader,
  SectionHeader,
  Spacer,
} from '@appComponents/ScreenLayout';
import Text from '@appComponents/Text';
import Radio from '@appComponents/Radio';
import DataTable, { Cell, PlainCell } from '@appComponents/DataTable';
import { useConfirmation } from '@appComponents/Dialog';
import type { Trip } from '@appUtils/tripConverter';

type AircraftProps = {
  onSelect: AircraftItem => void,
  selected?: AircraftItem,
  aircraftOptions: {
    available: AircraftItem[],
    unavailable: AircraftItem[],
    list: AircraftItem[],
    loading: boolean,
  },
  owner?: { id: string },
};

type AircraftItem = {
  tailNumber: string,
  name: string,
};

const Aircraft = ({
  onSelect,
  selected,
  aircraftOptions,
  owner,
}: AircraftProps): Node => {
  const { confirm: confirmUnavailable, confirmationNode } = useConfirmation({
    title: 'Schedule Unavailable Aircraft',
    message: 'Are you sure you want to schedule an unavailable aircraft?',
    action: onSelect,
  });

  const noOptions = Boolean(owner) && _.isEmpty(aircraftOptions.list);

  return (
    <>
      <AircraftLayout>
        <AircraftList
          title="Available Aircraft"
          loading={aircraftOptions.loading}
          options={aircraftOptions.available}
          onSelect={onSelect}
          selected={selected}
        />
        <Spacer dir="horizontal" size={3.25} />
        <AircraftList
          title="Unavailable Aircraft"
          loading={aircraftOptions.loading}
          options={aircraftOptions.unavailable}
          onSelect={confirmUnavailable}
          selected={selected}>
          <UnavailableReasonCell name="why" title="Why" />
        </AircraftList>
      </AircraftLayout>
      <MessageBox>
        {_.isEmpty(owner) && <Text>Select an owner to see their aircraft</Text>}
        {noOptions && <Text>The owner does not have any aircraft</Text>}
        {confirmationNode}
      </MessageBox>
    </>
  );
};

const AircraftList = ({
  title,
  onSelect,
  selected,
  loading,
  options = [],
  children,
}) => {
  return (
    <ListSection>
      <SectionHeader>
        <Text color="dark" weight={500}>
          {title}
        </Text>
      </SectionHeader>

      <AircraftTable data={options} emptyMessage={loading && <ScreenLoader />}>
        <RadioCell name="select" onSelect={onSelect} selected={selected} />
        <PlainCell title="Tail #" path="tailNumber" flex={1} />
        <PlainCell title="Location" path="location" flex={1.5} />
        <PlainCell title="Name" path="name" flex={2} />
        <PlainCell title="Type" path="type" flex={2} />
        {children}
      </AircraftTable>
    </ListSection>
  );
};

const RadioCell = ({ item, selected, onSelect, ...cellProps }) => (
  <Cell {...cellProps}>
    <Radio
      style={{ padding: 0 }}
      color="#40AFED"
      value={item.tailNumber}
      checked={item.tailNumber === selected?.tailNumber}
      onChange={() => onSelect(item)}
    />
  </Cell>
);

const UnavailableReasonCell = ({ item, ...cellProps }) => {
  const { navigate } = useNavigation();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const hasSquawks = _.size(item.squawks) > 0;
  const hasOverlap = _.size(item.overlappingTrips) > 0;

  return (
    <Cell {...cellProps}>
      <Menu
        visible={tooltipVisible}
        onDismiss={() => setTooltipVisible(false)}
        anchor={
          <IconButton
            icon="help"
            title="Why unavailable?"
            onPress={() => setTooltipVisible(current => !current)}
          />
        }>
        {hasSquawks && (
          <List.Section title="Squawks">
            <Box ph={1}>
              <Text>Count: {_.size(item.squawks)}</Text>
            </Box>
          </List.Section>
        )}
        {hasOverlap && (
          <List.Section title="Overlapping Trips">
            {item.overlappingTrips.map(trip => (
              <OverlappingTrip
                key={trip.path}
                trip={trip}
                navigate={navigate}
              />
            ))}
          </List.Section>
        )}
      </Menu>
    </Cell>
  );
};

const OverlappingTrip = ({ trip, navigate }: { trip: Trip }) => {
  const start = _.head(trip.legs);
  const end = _.last(trip.legs);
  const fromDate = start.departureDate.toLocaleString(DateTime.DATE_SHORT);
  const toDate = end.departureDate.toLocaleString(DateTime.DATE_SHORT);

  return (
    <Box ph={1} mb={0.5}>
      <Text>
        <Text
          color="primary"
          onPress={() => navigate('Trip Builder', { documentPath: trip.path })}>
          {trip.identifier}
        </Text>
        {'\n'}
        <Text>
          • {fromDate} {fromDate !== toDate && `- ${toDate}`}
          {'\n'}
          {Boolean(start.from) && `• ${start.from} - ${end.to}`}
        </Text>
      </Text>
    </Box>
  );
};

const AircraftLayout = styled.View`
  flex-direction: row;
`;

const AircraftTable: typeof DataTable = styled(DataTable)(({ theme }) => ({
  paddingHorizontal: 0,
}));

const ListSection = styled(List.Section)(({ theme }) => ({
  flex: 1,
  textTransform: 'uppercase',
}));

const MessageBox = styled.View(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  marginVertical: 'auto',
}));

export default Aircraft;
