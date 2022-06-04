/**
 * @file
 * A component for creating or editing a DRAFT trip
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import styled from '@emotion/native';
import { TextInput } from 'react-native-paper';
import _ from 'lodash';
import { useAsyncCallback } from 'react-async-hook';

import { CompositeScreenProps } from '@react-navigation/native';

import Button from '@appComponents/Button';
import {
  Box,
  Header,
  MainSurface,
  ScreenLayout,
  ScreenLoader,
} from '@appComponents/ScreenLayout';
import TextField from '@appComponents/TextField';
import Text from '@appComponents/Text';
import { useTripAircraft } from '@appUtils/aircraft';
import { useTrip, useTripPilotOptions } from '@appUtils/manager';
import * as Phone from '@appUtils/phone';
import { OwnerState, TripState, TripTab } from '@appUtils/tripConverter';
import Steps from '../../../components/Steps';
import SelectOwner from '../../../components/SelectOwner';
import OwnerStatus from '../../../components/OwnerStatus';
import TripLegs from './TripLegs';
import Aircraft from './Aircraft';
import Pilots from './Pilots';
import Passengers from './Passengers';
import TripName from './TripName';
import TripNotes from './TripNotes';
import useExitConfirmation from './useExitTripBuilderConfirmation';

const TripBuilder = ({ route, navigation }: CompositeScreenProps) => {
  const path = route.params?.documentPath;
  const builder = useDraftTrip(path);
  const { confirmationNode, screenVisible } = useExitConfirmation(
    builder,
    navigation,
  );

  return (
    <>
      {screenVisible && (
        <ScreenLayout alignItems="stretch">
          <TripBuilderHeader builder={builder} />
          <TripBuilderContent builder={builder} navigation={navigation} />
        </ScreenLayout>
      )}
      {confirmationNode}
    </>
  );
};

const TripBuilderHeader = ({ builder }) => (
  <Header>
    <SelectOwner
      key={builder.trip?.owner}
      owner={builder.trip?.owner}
      isClearable={false}
      disabled={
        builder.trip?.createdBy === _.get(builder, ['trip', 'owner', 'id'], '')
      }
      onChange={builder.changeOwner}
      controlStyle={styles.ownerField}
    />
    {builder.trip?.owner && (
      <>
        <TextField
          label="Contact Owner"
          editable={false}
          value={Phone.parse(builder.trip.owner.phoneNumber).formatNational()}
          wrapStyle={styles.phoneField}
          left={<TextInput.Icon name="phone" />}
        />
        <OwnerStatus state={builder.trip.owner.state} />
      </>
    )}
  </Header>
);

const TripBuilderContent = ({ builder, navigation }) => {
  const trip = builder.trip;
  const saveDraft = useAsyncCallback(builder.save);

  const done = useCallback(() => {
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

    navigation.navigate('Trips', { tab });
  }, [navigation, trip.state]);

  return (
    <BuildSurface>
      <Box dir="row" mh={1.5} height={42} jc="center">
        <TripName value={trip.customName} onChange={builder.changeCustomName} />
        <Box flex={1} />
        <TripNotes
          mode="contained"
          mr={0.5}
          key={trip.notes}
          defaultValue={trip.notes}
          onSave={builder.changeNotes}
          style={styles.button}
        />
        <Button
         disabled
          mode="outlined"
          icon="arrow-drop-down"
          style={styles.button}
          pointerEvents="none">
          Messages
        </Button>
      </Box>
      {builder.loading && <ScreenLoader />}

      {builder.error && <Text>{builder.error.message}</Text>}

      {!builder.loading && !builder.error && (
        <StepContent>
          <BuildSteps
            steps={builder.steps}
            onStepPress={builder.setActiveIndex}
            activeIndex={builder.activeIndex}
          />

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {builder.currentStep.render()}
          </ScrollView>
        </StepContent>
      )}
      <BuildFooter>
        <Button
          loading={saveDraft.loading}
          ml="auto"
          mr={1}
          color="accent"
          mode="outlined"
          disabled={saveDraft.loading || !builder.canSave}
          onPress={saveDraft.execute}>
          Save And Send
        </Button>

        <Button onPress={done} color="dark">
          Done
        </Button>
      </BuildFooter>
    </BuildSurface>
  );
};

const useDraftTrip = documentPath => {
  const { update, data: trip, save, reset, ...builder } = useTrip(documentPath);
  const aircraftOptions = useTripAircraft(trip);
  const tripAircraft = aircraftOptions.list.find(
    o => o.tailNumber === trip.aircraft?.tailNumber,
  );

  const pilotOptions = useTripPilotOptions(trip, tripAircraft?.pilots);

  const changeLegs = useCallback(legs => update({ legs }), [update]);
  const changePilots = useCallback(pilots => update({ pilots }), [update]);
  const changeNotes = useCallback(notes => update({ notes }), [update]);

  const selectAircraft = useCallback(
    aircraft => update({ aircraft }),
    [update],
  );

  const changeOwner = useCallback(
    async owner => {
      const ownerData = {
        ...owner,
        state: OwnerState.MANAGER_DRAFT,
      };
      update({
        owner: ownerData,
        aircraft: null,
        pilots: [],
      });
    },
    [update],
  );

  const changeCustomName = useCallback(
    customName => update({ customName }),
    [update],
  );

  const changePassengers = useCallback(
    (leg, passengers) =>
      update({
        legs: trip.legs.map(existingLeg => {
          if (existingLeg.id === leg.id) {
            existingLeg.passengers = passengers;
          }

          return existingLeg;
        }),
      }),
    [trip, update],
  );

  const setLeadPassenger = useCallback(
    (leg, passenger) =>
      update({
        legs: trip.legs.map(existingLeg => {
          if (existingLeg.id === leg.id) {
            existingLeg.passengers = [
              passenger,
              ...existingLeg.passengers.filter(p => p.name !== passenger.name),
            ];
          }

          return existingLeg;
        }),
      }),
    [trip, update],
  );

  const dispatchTrip = useCallback(() => {
    update({ state: TripState.UPCOMING });
    return save();
  }, [save, update]);

  const steps = useMemo(
    () => [
      {
        name: 'Legs',
        isComplete: Boolean(
          trip.owner && _.head(trip.legs).from && _.head(trip.legs).to,
        ),
        render: () => <TripLegs legs={trip.legs} onChange={changeLegs} />,
      },
      {
        name: 'Aircraft',
        isComplete: Boolean(trip.aircraft?.tailNumber),
        hasWarning: aircraftOptions.unavailable.some(
          option => option.tailNumber === trip.aircraft?.tailNumber,
        ),
        render: () => (
          <Aircraft
            onSelect={selectAircraft}
            selected={trip.aircraft}
            aircraftOptions={aircraftOptions}
            owner={trip.owner}
            legs={trip.legs}
          />
        ),
      },
      {
        name: 'Passengers',
        isComplete: _.size(trip.legs?.flatMap(leg => leg.passengers)) > 0,
        render: () => (
          <Passengers
            changePassengers={changePassengers}
            legs={trip.legs}
            setLeadPassenger={setLeadPassenger}
            ownerId={trip?.owner?.id}
          />
        ),
      },
      {
        name: 'Pilots',
        isComplete: _.size(trip.pilots) > 0,
        render: () => (
          <Pilots
            pilots={trip.pilots}
            pilotOptions={pilotOptions}
            changePilots={changePilots}
            aircraft={tripAircraft}
          />
        ),
      },
    ],
    [
      aircraftOptions,
      changeLegs,
      changePassengers,
      changePilots,
      pilotOptions,
      selectAircraft,
      setLeadPassenger,
      trip.aircraft,
      trip.legs,
      trip.owner,
      trip.pilots,
      tripAircraft,
    ],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const goToNextStep = useCallback(
    () => setActiveIndex(current => current + 1),
    [],
  );

  const goToPrevStep = useCallback(
    () => setActiveIndex(current => current - 1),
    [],
  );

  const init = useCallback(() => {
    reset();
    setActiveIndex(0);
  }, [reset]);

  const canSave = _.head(steps).isComplete && trip.customName;

  return {
    steps,
    activeIndex,
    setActiveIndex,
    goToPrevStep,
    goToNextStep,
    dispatchTrip,
    currentStep: steps[activeIndex],
    trip,
    changeOwner,
    changeCustomName,
    changeNotes,
    canSave,
    save,
    init,
    ...builder,
  };
};

const BuildSurface = styled(MainSurface)`
  padding-top: ${({ theme }) => theme.layout.space(1.25).toString()}px;
`;

const BuildSteps = styled(Steps)(({ theme }) => ({
  width: '85%',
  minWidth: 880,
  marginTop: theme.layout.space(2.25),
  alignSelf: 'center',
  marginBottom: theme.layout.space(3),
}));

const StepContent = styled.View(({ theme }) => ({
  flex: 1,
}));

const BuildFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  margin-top: auto;
  padding: ${({ theme }) =>
    `${theme.layout.space(1)}px ${theme.layout.space(1.5)}px`};
`;

const styles = {
  phoneField: {
    marginLeft: 16,
    marginBottom: 8,
  },
  ownerField: {
    height: 56,
    minWidth: 280,
  },
  button: {
    height: '100%',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
    width: '86%',
    minWidth: 900,
    marginHorizontal: 'auto',
  },
};

export default TripBuilder;
