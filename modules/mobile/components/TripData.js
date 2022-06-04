/**
 * @file
 * Reusable components used for rendering various trip data
 *
 * @format
 * @flow strict-local
 */
import React from 'react';

import styled from '@emotion/native';
import _ from 'lodash';
import { Divider } from 'react-native-paper';

import { findMyPilotData, useMyData } from '@appUtils/api';
import { OwnerState, UserRole } from '@appUtils/tripConverter';
import { Box, Circle, Spacer } from '@appComponents/ScreenLayout';
import Text from '@appComponents/Text';
import Button from '@appComponents/Button';

import type { OwnerStateValue, Trip } from '@appUtils/tripConverter';

export const Status = ({ trip, ...rest }: { trip: Trip }): Node => {
  const [user] = useMyData();
  const state =
    user?.role === UserRole.OWNER
      ? _.get(trip, ['owner', 'state'], '-')
      : findMyPilotData(trip)?.state ?? '-';

  const dotColor = getStateColorValue(state);

  return (
    <Box ai="flex-start" {...rest}>
      <Label size="smallest">STATUS</Label>
      <Box dir="row" ai="center">
        <Circle color={dotColor} size={8} />
        <Spacer dir="horizontal" size={1} />
        <Text size="medium" weight="bold" ls={1.25} lh={24}>
          {state.toUpperCase()}
        </Text>
      </Box>
    </Box>
  );
};

export const AircraftDetails = ({
  aircraft,
  forceTailOnNewRow,
  changes = [],
  ...rest
}): Node => (
  <Box ai="flex-start" {...rest}>
    <Label size="smallest">
      AIRCRAFT DETAILS
      <ChangeMarker visible={changes.some(c => c.startsWith('aircraft'))} />
    </Label>
    {Boolean(aircraft?.name) && (
      <Text weight="bold" size="medium" lh={26}>
        {aircraft.name}
      </Text>
    )}

    <Box dir="row" wrap="wrap" ai={forceTailOnNewRow ? 'flex-start' : 'center'}>
      <Text weight="bold" ls={0.5} lh={24}>
        {aircraft?.type ?? '-'}
      </Text>

      {Boolean(aircraft?.tailNumber) && (
        <>
          {!forceTailOnNewRow && <Spacer dir="horizontal" />}
          {forceTailOnNewRow && <Box width="100%" />}
          <AircraftTail mt={forceTailOnNewRow ? 0.5 : 0}>
            <Text weight="bold">#{aircraft.tailNumber}</Text>
          </AircraftTail>
        </>
      )}
    </Box>
  </Box>
);

export const Pilots = ({ pilots, changes = [], ...rest }) => (
  <Box ai="flex-start" {...rest}>
    <Label>
      PILOTS
      <ChangeMarker visible={changes.some(c => c.startsWith('pilots'))} />
    </Label>
    {_.map(pilots, (p, i) => (
      <Text key={i} size="medium" ls={0.5} lh={24}>
        {p.firstName} {p.lastName} {i === 0 && <>(PIC)</>}
      </Text>
    ))}
    {_.isEmpty(pilots) && <Text size="medium">-</Text>}
  </Box>
);

export const Section: typeof Box = ({ children, last = false, ...props }) => (
  <>
    <Box ai="flex-start" {...props}>
      {children}
    </Box>
    <SectionDivider last={last} />
  </>
);

export const SecondaryButton = ({
  children,
  padding,
  color,
  stroke,
  ...rest
}) => (
  <SecondaryButtonLayout
    color={color ?? 'secondary'}
    stroke={stroke}
    mode="outlined"
    padding={padding}
    {...rest}>
    {children}
  </SecondaryButtonLayout>
);

export const ChangeMarker: typeof Box = ({ visible, ...props }) =>
  visible ? (
    <Box ph={0.5} pv={0.5} {...props}>
      <Circle color="legLabel" size={6} />
    </Box>
  ) : null;

const SecondaryButtonLayout = styled(Button)(({ theme, padding = 0 }) => ({
  borderWidth: 1,
  padding: theme.layout.space(padding),
}));

export const Label = styled(Text)(({ theme }) => {
  return {
    color: theme.colors.heading,
    fontSize: 10,
    lineHeight: 12,
    marginBottom: theme.layout.space(0.5),
    letterSpacing: 1.5,
  };
});

export const SectionDivider = styled(Divider)(({ theme, last }) =>
  last
    ? { marginTop: theme.layout.space(3) }
    : {
        marginVertical: theme.layout.space(3),
        backgroundColor: theme.colors.border,
      },
);

const AircraftTail = styled(Box)(({ theme }) => ({
  borderColor: theme.colors.text,
  borderWidth: 1,
  borderRadius: 100,
  paddingHorizontal: theme.layout.space(2),
  paddingVertical: theme.layout.space(0.5),
}));

const getStateColorValue = (state: OwnerStateValue) => {
  switch (state) {
    case OwnerState.OWNER_REQUESTED:
      return '#FF00F5';
    case OwnerState.MANAGER_REQUESTED:
      return '#00FFF0';
    case OwnerState.MANAGER_ACKNOWLEDGED:
      return '#0072F9';
    case OwnerState.OWNER_ACCEPTED:
      return '#CCFF00';
    case OwnerState.MANAGER_UPDATED:
      return '#7B61FF';
    case OwnerState.MANAGER_CANCELED:
    case OwnerState.OWNER_REJECTED:
      return '#FF001F';
    case OwnerState.OWNER_SEEN:
      return '#0AFF4E';
    case OwnerState.MANAGER_DRAFT:
    default:
      return '#FA89A4';
  }
};
