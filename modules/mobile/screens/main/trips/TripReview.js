/**
 * @file
 * A screen to review trip details
 *
 * @format
 * @flow strict-local
 */
import React, { useEffect, useMemo, useCallback } from 'react';
import _ from 'lodash';
import { Svg, Path } from 'react-native-svg';
import { useAsyncCallback } from 'react-async-hook';
import notifee from '@notifee/react-native';
import app from '@appFirebase/app';
import { Box, ScreenLoader, Spacer } from '@appComponents/ScreenLayout';
import Text from '@appComponents/Text';
import { DateView, TimeView } from '@appComponents/DateTimeField/DateView';
import { useTheme } from '@appComponents/theme';
import { markSeen, useTrip } from '@appUtils/api';
import { saveTrip } from '@appUtils/trip';
import { TripState, OwnerState, Trip, UserRole } from '@appUtils/tripConverter';
import HeaderLeft from '../../../components/HeaderLeft';
import MobileView from '../../../components/MobileView';
import {
  Status,
  AircraftDetails,
  Pilots,
  Section,
  Label,
  ChangeMarker,
  SecondaryButton,
} from '../../../components/TripData';
import TripNotesButton from './TripNotes';
import { getUid } from '@appFirebase';
import { BorderedButton } from '@appComponents/Button';
import { notifyManagers } from '@appUtils/CloudFunctions';
import { DateTime } from 'luxon';
import { useTripSquawkList } from '@appUtils/squawks';
import { useMyData } from '@appUtils/api';
import { useAircraftData } from '@appUtils/aircraft';
import styled from '@emotion/native';
import { TouchableOpacity } from 'react-native';

type TripReviewProps = {
  route: {
    trip: Trip,
    params: {
      documentPath: string,
    },
  },
};

const TripReview = ({ route, navigation }: TripReviewProps): Node => {
  const { data, loading } = useTrip(route.params.documentPath);
  if (loading || !data) {
    return (
      <Box flex={1}>
        <ScreenLoader />
      </Box>
    );
  }

  return (
    <MobileView>
      <Box dir="row" flex={1} ph={2} pt={2}>
        <Details trip={data} navigation={navigation} />
      </Box>
    </MobileView>
  );
};

type TripReviewHeaderProps = {
  tintColor: string,
  route: {
    params: {
      documentPath: string,
    },
  },
};

export const TripReviewHeaderLeft = ({
  route,
  tintColor,
}: TripReviewHeaderProps) => {
  const trip = useTrip(route.params.documentPath).data;

  const title = getTitle(trip);
  const subTitle = [trip.identifier, trip.customName]
    .filter(Boolean)
    .join(' - ');

  return (
    <HeaderLeft
      tintColor={tintColor}
      route={route}
      title={title}
      subTitle={subTitle}
    />
  );
};

const Details = ({ trip, navigation }) => {
  const changedFields = useUnseenChanges(trip);
  const sendToManager = useAsyncCallback(() => {
    const doc = app.firestore().doc(trip.path);
    return saveTrip(
      {
        state: TripState.OWNER_REQUEST,
        owner: { ...trip.owner, state: OwnerState.OWNER_REQUESTED },
      },
      doc,
    );
  });

  const sendToManagerData = {
    messageBody: getNewTripNotificationBody(trip),
  };

  const useSendToManager = () => {
    sendToManager.execute();
    navigation.reset({
      index: 2,
      routes: [
        { name: 'Overview' },
        {
          name: 'List',
          params: {
            states: ['Owner Request', 'Draft'],
            title: 'Requested Trips',
          },
        },
        {
          name: 'Trip Review',
          params: {
            documentPath: trip.path,
          },
        },
      ],
    });
    notifyManagers(sendToManagerData);
  };

  useEffect(() => {
    return async () => {
      // We mark everything as seen when the user leaves the screen (component unmount)
      markSeen(trip, changedFields).catch(console.error);
      // Clear any remaining notifications for this trip from the notifications bar
      cleanupNotification(trip).catch(console.error);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aircraftId = trip.aircraft?.path
    ? _.last(_.split(trip.aircraft.path, '/'))
    : null;
  const tripId = trip.identifier;
  const { data: squawks } = useTripSquawkList({ aircraftId, tripId });

  return (
    <Box flex={3}>
      <StatusSection trip={trip} changes={changedFields} />

      {/* TODO: FW-409 - Remove this Box and related fields */}
      <Box>
        <Text>Squawks:</Text>
        {_.size(squawks) > 0 ? (
          squawks.map((squawk, i) => (
            <Text>
              {i + 1}: {squawk.title}
            </Text>
          ))
        ) : (
          <Text>No squawks</Text>
        )}
      </Box>
      <AircraftSection
        aircraft={trip.aircraft}
        changes={changedFields}
        navigation={navigation}
        trip={trip}
      />

      <PilotsSection pilots={trip.pilots} changes={changedFields} />
      {_.map(trip.legs, (leg, i, all) => (
        <Leg
          key={i}
          data={leg}
          index={i}
          last={i === all.length - 1}
          changes={changedFields}
          navigation={navigation}
          trip={trip}
        />
      ))}
      <SendToManagerButton trip={trip} onPress={useSendToManager} />
    </Box>
  );
};

const StatusSection = ({ trip, changes = [] }) => (
  <Section>
    <Status trip={trip} />

    <Spacer size={2} />

    <Notes
      trip={trip}
      hasChanges={_.some(changes, c => c.startsWith('notes'))}
    />
  </Section>
);

const Notes = ({ trip, hasChanges }) => {
  const save = useAsyncCallback(notes => {
    const doc = app.firestore().doc(trip.path);
    return saveTrip({ notes }, doc);
  });

  return (
    <Box dir="row">
      <TripNotesButton
        notes={trip.notes}
        loading={save.loading}
        onSave={save.execute}
      />
      <ChangeMarker visible={hasChanges} ph={0} pv={0.5} ml={-10} />
    </Box>
  );
};

const AircraftSection = ({ aircraft, changes, navigation, trip }) => {
  // TODO: FW-409 - Navigate to the squawks list screen instead of the squawk details screen
  return (
    <Section>
      <AircraftDetails
        forceTailOnNewRow
        aircraft={aircraft}
        changes={changes}
      />
      <DetailsButton
        onPress={() =>
          navigation.navigate('Squawk', {
            trip,
            action: 'ADD',
          })
        }>
        Squawks
      </DetailsButton>
    </Section>
  );
};

const PilotsSection = ({ pilots, changes }) => (
  <Section>
    <Pilots pilots={pilots} changes={changes} />
  </Section>
);

const Leg = ({ data, index, last, changes = [], navigation, trip, }) => {
  const documentPath = trip.aircraft.path;
  const [craft] = useAircraftData(documentPath);
  
  const legChanges = changes
    .filter(c => c.startsWith(`legs.${index}.`))
    .map(c => c.slice(`legs.${index}.`.length));

  const isNewLeg = legChanges.includes('id');
  const [user] = useMyData();

  const updateFuel = useCallback(
    () => navigation.navigate('Update Fuel', { data, index, craft, documentPath: trip.path }));

  return (
    <Section last={last}>
      <Text size="medium" color="subTitle" weight="400" lh={24}>
        LEG {index + 1}
        <ChangeMarker visible={isNewLeg} />
      </Text>

      <Box dir="row" mv={1} ai="center">
        <Text size="medium" weight="400" lh={24}>
          {data.from || '?'}
        </Text>
        <LegDash />
        <Text size="medium" weight="400" lh={24}>
          {data.to || '?'}
        </Text>
        <ChangeMarker
          visible={
            !isNewLeg && legChanges.some(c => c === 'from' || c === 'to')
          }
        />
      </Box>

      <Box mv={1}>
        <Label>DEPARTURE DATE</Label>
        <Text size="medium" weight="400" lh={24}>
          <DateView date={data.departureDate} fallback="-" />
        </Text>
      </Box>

      <Box mv={1}>
        <Label>
          DEPARTURE TIME
          <ChangeMarker
            visible={!isNewLeg && legChanges.includes('departureDate')}
          />
        </Label>
        <Text size="medium" weight="400" lh={24}>
          <TimeView date={data.departureDate} fallback="-" />
        </Text>
      </Box>

      <Box mv={1}>
        <Box dir="row" width={'100%'} jc="space-between">
          <Box>
            <Label>
              FUEL DETAILS
            </Label>
          </Box>
          {user?.role === UserRole.PILOT && !trip.archived ?
            <Box>
              <TouchableOpacity onPress={updateFuel}>
                <Text color="secondary" size="small" weight="400" lh={16} ls={1.25} >UPDATE</Text>
              </TouchableOpacity>
            </Box>
            :
            null
          }
        </Box>
        <Text size="medium" weight="400" lh={24}>
          Fuel On: {craft?.fuel ? `${craft.fuel} lbs` : '-'}
        </Text>
        <Text size="medium" weight="400" lh={24}>
          Fuel Off: {craft?.fuelOff ? `${craft.fuelOff} lbs` : '-'}
        </Text>
        <Text size="medium" weight="400" lh={24}>
          Fuel Used: {craft?.fuel ? `${craft.fuel - craft.fuelOff} lbs` : '-'}
        </Text>
      </Box>

      <Box mt={1}>
        <Label>
          PASSENGERS
          <ChangeMarker
            visible={
              !isNewLeg && legChanges.some(c => c.startsWith('passengers'))
            }
          />
        </Label>
        {_.map(data.passengers, (p, i) => (
          <PassengerItem passenger={p} isLead={i === 0} />
        ))}
        {_.isEmpty(data.passengers) && (
          <PassengerItem passenger={{ name: '-' }} />
        )}
      </Box>
    </Section>
  );
};

const PassengerItem = ({ passenger, isLead }) => (
  <Box mb={0.5}>
    <Text size="medium" weight="400" lh={24}>
      {passenger.name} {isLead && '(LP)'}
    </Text>
  </Box>
);

const LegDash = () => {
  const theme = useTheme();

  return (
    <Box mh={1}>
      <Svg width={70} height={2}>
        <Path
          stroke={theme.colors.heading}
          strokeDasharray={4}
          strokeDashoffset={-1}
          d="M0 1L70 1"
        />
      </Svg>
    </Box>
  );
};

const SendToManagerButton = ({ trip, onPress }) => {
  if (trip.state === TripState.OWNER_DRAFT) {
    return <BorderedButton onPress={onPress}>Send to Manager</BorderedButton>;
  }
  return null;
};

const useUnseenChanges = (trip: Trip) =>
  useMemo(() => _.get(trip.unseenChanges, getUid(), []), [trip.unseenChanges]);

const cleanupNotification = async (trip: Trip) => {
  const notificationsToClear = (await notifee.getDisplayedNotifications())
    .filter(entry => entry.notification.data?.documentPath === trip.path)
    .map(entry => entry.id);

  return notifee.cancelDisplayedNotifications(notificationsToClear);
};

const getTitle = (trip: Trip) => {
  switch (trip.state) {
    case TripState.OWNER_DRAFT:
      return 'Trip Builder - Review';
    case TripState.OWNER_REQUEST:
    case TripState.DRAFT:
      return 'Requested Trip';
    case TripState.UPCOMING:
      return 'Upcoming Trip';
    case TripState.ACTIVE:
      return 'Active Trip';
    case TripState.ENDED:
      return 'Completed Trip';
    case TripState.CANCELLED:
      return 'Cancelled Trip';
    default:
      return 'Loading Details...';
  }
};

export const getNewTripNotificationBody = trip => {
  const ownerName = `${trip.owner.firstName} ${trip.owner.lastName}`;
  const tripName = trip.customName ? `(${trip.customName}) ` : '';
  const from = _.first(trip.legs)?.from;
  const to = _.last(trip.legs)?.to;
  const departure = DateTime.fromSeconds(
    trip.dateDeparting.seconds,
  ).toLocaleString({
    weekday: 'short',
    month: 'short',
    day: '2-digit',
  });

  return `${ownerName} is requesting a new trip ${tripName}from ${from} to ${to} on ${departure}.`;
};

const DetailsButton = styled(SecondaryButton)`
  width: 100%;
  margin-top: 10px;
`;

export default TripReview;
