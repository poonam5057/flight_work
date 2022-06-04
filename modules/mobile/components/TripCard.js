/**
 * @file
 * Trip card component used in listing
 *
 * @format
 * @flow strict-local
 */
import React, { useCallback } from 'react';
import { View } from 'react-native';
import _ from 'lodash';
import { Surface, TouchableRipple } from 'react-native-paper';
import { useAsyncCallback } from 'react-async-hook';
import styled from '@emotion/native';
import { useNavigation } from '@react-navigation/native';

import app, { getUid } from '@appFirebase';
import { Box, Spacer } from '@appComponents/ScreenLayout';
import Button from '@appComponents/Button';
import Text from '@appComponents/Text';
import { Icon, useTheme } from '@appComponents/theme';
import tripConverter, {
  TripState,
  Trip,
  UserRole,
  PilotState,
  OwnerState,
} from '@appUtils/tripConverter';
import { useMyData } from '@appUtils/api';
import { DateView, TimeView } from '@appComponents/DateTimeField/DateView';
import VerticalProgressTracker from './VerticalProgressTracker';
import { AircraftDetails, Label, SecondaryButton, Status } from './TripData';
import { notifyManagers } from '@appUtils/CloudFunctions';

type TripCardProps = {
  trip: Trip,
  showMessagesButton?: boolean,
};

const TripCard = ({ trip, showMessagesButton }: TripCardProps) => {
  const [user] = useMyData();

  if (user?.role === UserRole.PILOT) {
    return <PilotCard trip={trip} />;
  }

  return <OwnerCard trip={trip} showMessagesButton={showMessagesButton} />;
};

const PilotCard = ({ trip }: TripCardProps) => {
  const navigation = useNavigation();
  const pilot = trip.pilots.find(p => p.id === getUid());
  const hasPendingActions =
    pilot?.state === PilotState.MANAGER_REQUESTED ||
    pilot?.state === PilotState.PILOT_REJECTED;

  const openTrip = useCallback(
    () => navigation.navigate('Trip Review', { documentPath: trip.path }),
    [navigation, trip.path],
  );

  return (
    <TripCardContainer>
      <TouchableRipple onPress={openTrip}>
        <Box ph={3} pv={2}>
          {!hasPendingActions && <Status trip={trip} />}
          <Title trip={trip} />
          <RequestDetails trip={trip} pilot={pilot} />
          <MessagesButton />
          <Spacer size={2} />
        </Box>
      </TouchableRipple>
      {hasPendingActions && <NewTripPilotActions trip={trip} pilot={pilot} />}
    </TripCardContainer>
  );
};

const OwnerCard = ({ trip, showMessagesButton }) => {
  const navigation = useNavigation();
  const hasPendingActions =
    trip.owner?.state === OwnerState.MANAGER_REQUESTED ||
    trip.owner?.state === OwnerState.OWNER_REJECTED;

  const openTrip = useCallback(() => {
    const screen =
      trip.state === TripState.OWNER_DRAFT ? 'Trip Builder' : 'Trip Review';

    navigation.navigate(screen, { documentPath: trip.path });
  }, [navigation, trip.path, trip.state]);

  return (
    <TripCardContainer>
      <TouchableRipple onPress={openTrip}>
        <Box ph={2} pv={2}>
          <TopSection trip={trip} />
          <TripDeparture date={_.head(trip.legs)?.departureDate} />
          <Spacer size={2} />
          {!hasPendingActions && <Status trip={trip} />}
          {showMessagesButton && <MessagesButton />}
        </Box>
      </TouchableRipple>
      {hasPendingActions && <NewTripOwnerActions trip={trip} />}
    </TripCardContainer>
  );
};

const NewTripOwnerActions = ({ trip }) => {
  const isRejected = trip.owner.state === OwnerState.OWNER_REJECTED;
  const updateState = useUpdateOwnerStateCallback(trip);

  return (
    <CardActionsWrap>
      <CardAction
        onPress={() => updateState(OwnerState.OWNER_REJECTED)}
        title={isRejected ? 'Rejected' : 'Reject'}
        error={isRejected}
      />
      <CardAction
        bl
        title="Accept"
        onPress={() => updateState(OwnerState.OWNER_ACCEPTED)}
      />
    </CardActionsWrap>
  );
};

const NewTripPilotActions = ({ trip, pilot }) => {
  const isRejected = pilot.state === PilotState.PILOT_REJECTED;
  const updateState = useUpdatePilotStateCallback({ trip, pilot });

  return (
    <CardActionsWrap>
      <CardAction
        onPress={() => {
          updateState(PilotState.PILOT_REJECTED);
          notifyManagers({
            messageBody: getPilotResponseNotificationBody(
              pilot,
              trip.identifier,
              'rejected',
            ),
          });
        }}
        title={isRejected ? 'Rejected' : 'Reject'}
        error={isRejected}
      />
      <CardAction
        bl
        title="Accept"
        onPress={() => {
          updateState(PilotState.PILOT_ACCEPTED);
          notifyManagers({
            messageBody: getPilotResponseNotificationBody(
              pilot,
              trip.identifier,
              'accepted',
            ),
          });
        }}
      />
    </CardActionsWrap>
  );
};

const RequestDetails = ({ trip, pilot }) => {
  const [user] = useMyData();

  const role = trip.pilots[0].id === pilot.id ? 'pilot' : 'second';
  const manager = user?.managementCompany?.name || 'Your Management Company';
  const date = <DateView date={_.head(trip.legs)?.departureDate} fallback="" />;

  return (
    <Box pb={1}>
      <Text weight="700" lh={22}>
        Request from {manager}
      </Text>
      <Box pl={1}>
        <Text lh={20}>
          {manager} has invited you to be {role} in command on a flight on{' '}
          {date}.
        </Text>
      </Box>
    </Box>
  );
};

const TopSection = ({ trip }) => {
  const finishedTrip =
    _.includes([TripState.ENDED, TripState.CANCELLED], trip.state) ||
    trip.archived;

  const highlightedCurrentLocation = _.includes(
    [TripState.UPCOMING, TripState.ACTIVE],
    trip.state,
  );

  const currentLocationIndex = highlightedCurrentLocation ? 0 : -1;

  return (
    <TopSectionWrapper>
      <Box flex={1} pr={2}>
        <Title trip={trip} />
        <AircraftDetails aircraft={trip.aircraft} />
      </Box>
      <VerticalProgressTracker
        legs={trip.legs}
        currentIndex={currentLocationIndex}
        finished={finishedTrip}
      />
    </TopSectionWrapper>
  );
};

const Title = ({ trip }: { trip: Trip }) => {
  const text = trip.customName
    ? `${trip.identifier} - ${trip.customName}`
    : trip.identifier;

  return (
    <TitleWrap>
      <StyledIcon name="mobile-aircraft" color="white" />
      <Text color="legLabel" weight="700">
        {text}
      </Text>
    </TitleWrap>
  );
};

const TripDeparture = ({ date }) => {
  return (
    <Box>
      <Label>TRIP DEPARTURE</Label>
      <Text size="small" weight="400" lh={24}>
        <TimeView date={date} fallback="-" />{' '}
        <DateView date={date} fallback="" />
      </Text>
    </Box>
  );
};

const MessagesButton = () => {
  const theme = useTheme();
  return (
    <>
      <Spacer size={3} />
      <SecondaryButton
        padding={1}
        icon="mobile-messages"
        color="disabled"
        stroke={theme.colors.disabled}>
        MESSAGES
      </SecondaryButton>
    </>
  );
};

const CardAction = ({ onPress, bl, title, error }) => {
  const theme = useTheme();
  const color = error ? theme.colors.error : theme.colors.text;
  const action = useAsyncCallback(onPress);

  return (
    <CardActionButtonWrap
      labelStyle={{ color }}
      mode="text"
      onPress={action.execute}
      loading={action.loading}
      disabled={error}
      bl={bl}>
      {title}
    </CardActionButtonWrap>
  );
};

const useUpdatePilotStateCallback = ({ trip, pilot }) =>
  useCallback(
    state =>
      updateTrip(trip.path, {
        pilots: trip.pilots.map(p => ({
          ...p,
          state: pilot.id === p.id ? state : p.state,
        })),
      }),
    [pilot.id, trip.path, trip.pilots],
  );

const useUpdateOwnerStateCallback = trip =>
  useCallback(
    state => updateTrip(trip.path, { owner: { ...trip.owner, state } }),
    [trip.owner, trip.path],
  );

const updateTrip = (docPath, updates) =>
  app.firestore().doc(docPath).update(tripConverter.toFirestore(updates));

const TripCardContainer = styled(Surface)(({ theme, padding = 0 }) => ({
  flexDirection: 'column',
  width: 344,
  backgroundColor: theme.colors.tripCardBackground,
  padding: theme.layout.space(padding),
}));

const TopSectionWrapper = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;

export const getPilotResponseNotificationBody = (
  pilot,
  tripIdentifier,
  response,
) => {
  const pilotName = `${pilot.firstName} ${pilot.lastName}`;
  return `${pilotName} has ${response} ${tripIdentifier}.`;
};

const TitleWrap = styled(View)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  marginLeft: theme.layout.space(0.5),
  marginVertical: theme.layout.space(1.25),
}));

const CardActionsWrap = styled.View(({ theme }) => ({
  flex: 1,
  height: 72,
  flexDirection: 'row',
  borderTopWidth: 0.4,
  borderColor: theme.colors.text,
}));

const CardActionButtonWrap = styled(Button)(({ theme, bl }) => ({
  flex: 1,
  height: '100%',
  borderColor: theme.colors.text,
  borderRadius: 0,
  borderLeftWidth: bl ? 0.4 : 0,
  justifyContent: 'center',
}));

const StyledIcon = styled(Icon)`
  margin-right: 8px;
`;

export default TripCard;
