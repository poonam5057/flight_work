/**
 * @file
 * A component displaying Trip information
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback } from 'react';
import styled from '@emotion/native';
import { DateTime } from 'luxon';
import _ from 'lodash';

import {
  Box,
  SectionBody,
  SectionHeader,
  Spacer,
} from '@appComponents/ScreenLayout';
import Text, { PersonText } from '@appComponents/Text';
import Button from '@appComponents/Button';
import DataTable, { Cell, PlainCell } from '@appComponents/DataTable';
import ProgressTracker from '@appComponents/ProgressTracker';
import type { ViewStyle } from 'react-native';
import { TripState, TripTab } from '@appUtils/tripConverter';
import { useNavigation } from '@react-navigation/native';

type TripDetailsProps = {
  data: Object,
  onEdit: string => void,
  style?: ViewStyle,
};

const TripDetails = ({ data, onEdit, style }: TripDetailsProps) => (
  <Box pv={1} style={style}>
    <TripInfoSection trip={data} onEdit={onEdit} />
    <Spacer size={3} />
    <LegDetailsSection legs={data.legs} onEdit={onEdit} />
  </Box>
);

const TripInfoSection = ({ trip, onEdit }) => {
  const steps = getProgressSteps(trip);
  const { navigate } = useNavigation();

  const backToTrips = useCallback(() => {
    const tab = _.get(
      {
        [TripState.OWNER_REQUEST]: TripTab.REQUESTED,
        [TripState.DRAFT]: TripTab.DRAFT,
        [TripState.UPCOMING]: TripTab.UPCOMING,
        [TripState.ACTIVE]: TripTab.ACTIVE,
        [TripState.ENDED]: TripTab.COMPLETED,
        [TripState.CANCELLED]: TripTab.COMPLETED,
      },
      trip.state,
      TripTab.DRAFT,
    );

    navigate('Trips', { tab });
  }, [navigate, trip.state]);

  return (
    <>
      <SectionHeader>
        <Text color="dark" weight={500}>
          TRIP INFO
        </Text>
        {!trip.archived && (
          <Button
            mode="outlined"
            icon="edit"
            color="dark"
            ml={1}
            onPress={onEdit}
          />
        )}
        <Button ml="auto" onPress={backToTrips}>
          Back to Trips
        </Button>
      </SectionHeader>
      <SectionBody>
        <DataTable data={[trip]}>
          <PlainCell title="Tail #" path="aircraft.tailNumber" />
          <PlainCell title="Type" path="aircraft.type" />
          <NameCell title="Pilot in Command" path="pilots.0" />
          <NameCell title="Second in Command" path="pilots.1" />
          <PlainCell title="Notes" path="notes" />
        </DataTable>

        <Spacer />

        <Text size="smallest" weight="bold">
          {trip.status?.toUpperCase()}
        </Text>
        <LocationTracker>
          <ProgressTracker steps={steps} currentStep={steps.length} />
        </LocationTracker>
      </SectionBody>
    </>
  );
};

const NameCell = ({ item, path, flex }) => (
  <Cell flex={flex}>
    <PersonText entry={_.get(item, path)} />
  </Cell>
);

const LegDetailsSection = ({ legs = [], onEdit }) => (
  <>
    <SectionHeader>
      <Text color="dark" weight={500}>
        LEG DETAILS
      </Text>
    </SectionHeader>
    <SectionBody>
      {legs.map((leg, index) => (
        <Leg key={`leg-${index}`} leg={leg} title={`LEG ${index + 1}`} />
      ))}
    </SectionBody>
  </>
);

const Leg = ({ leg, title = 'Leg' }) => {
  return (
    <>
      <Spacer />

      <LegTitle>
        <Text>{title.toUpperCase()}</Text>
      </LegTitle>

      <Spacer />

      <Text size="medium" color="dark" weight={500}>
        {leg.from} > {leg.to}
      </Text>

      <Spacer />

      <DataTable data={[leg]}>
        <DepartureCell title="Departure" flex={10} />
        <FuelUsedCell title="Fuel Used" flex={6} />
        <PlainCell title="Fuel On" path="fuelOn" flex={6} />
        <PlainCell title="Fuel Off" path="fuelOff" flex={6} />
      </DataTable>

      <Spacer />

      <SectionHeader>
        <Text color="dark" weight={500}>
          PASSENGERS
        </Text>
      </SectionHeader>

      <SectionBody>
        {leg.passengers.map((passenger, i) => (
          <LegPassenger key={i} passenger={passenger} isLead={i === 0} />
        ))}
      </SectionBody>

      <Spacer size={2} />
    </>
  );
};

const DepartureCell = ({ item, ...cellProps }) => {
  const departureDate = item?.departureDate;
  if (!departureDate) {
    return <Cell {...cellProps}>-</Cell>;
  }

  const date = departureDate.toLocaleString(DateTime.DATE_SHORT);
  const time = departureDate.toLocaleString(DateTime.TIME_WITH_SHORT_OFFSET);

  return <Cell {...cellProps}>{[date, time].join(' @ ')}</Cell>;
};

const FuelUsedCell = ({ item, ...cellProps }) => (
  <Cell {...cellProps}>{item?.fuelOn ? item.fuelOn - item.fuelOff : '-'}</Cell>
);

const LegPassenger = ({ passenger, isLead }) => (
  <>
    <Spacer size={0.75} />
    <Text size="medium" color="dark">
      {passenger.name}
      {isLead && ' (Lead)'}
    </Text>
  </>
);

const getProgressSteps = trip => [
  _.head(trip.legs).from,
  ...trip.legs.map(leg => leg.to),
];

const LegTitle = styled.View`
  flex-direction: row;
  align-items: center;
`;

const LocationTracker = styled.View`
  max-width: 30%;
`;

export default TripDetails;
