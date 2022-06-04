/**
 * @file
 * A Trip Builder for Owners
 *
 * @format
 * @flow strict-local
 */
import React, {
  Node,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import styled from '@emotion/native';
import {
  useFieldArray,
  useForm,
  useFormState,
  Controller,
} from 'react-hook-form';
import { View } from 'react-native';
import _ from 'lodash';
import { NavigationProp } from '@react-navigation/native';

import { saveTrip } from '@appUtils/trip';
import { useTheme } from '@appComponents/theme';
import {
  Box,
  ScreenLayout,
  ScreenLoader,
  Spacer,
} from '@appComponents/ScreenLayout';
import { useTrip } from '@appUtils/api';
import { TextFormField } from '@appComponents/forms/FormFields';
import { getZoneInformation } from '@appComponents/DateTimeField/DateView';
import Button, { BorderedButton } from '@appComponents/Button';
import Notification from '@appComponents/Notification';
import MobileView from '../../../components/MobileView';
import TripBuilderLeg from '../../../components/TripBuilderLeg';
import DropdownFormField from '../../../components/DropdownFormField';
import { SecondaryButton } from '../../../components/TripData';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import { useExistingAircraft } from '../../../utils/aircraft';
import TripNotesButton from './TripNotes';

const emptyLeg = {
  from: '',
  to: '',
  passengers: [],
  date: new Date(),
  time: new Date(),
  timeZone: '',
  departureDate: new Date(),
};

const getNewLeg = (index, legs) => {
  return {
    from: legs[index].to || '',
    to: '',
    passengers: legs[index].passengers || [],
    date: legs[index].date || new Date(),
    time: legs[index].time || new Date(),
    timeZone: '',
    departureDate: new Date(),
  };
};

type TripBuilderProps = {
  navigation: NavigationProp,
  route: {
    params?: {
      documentPath?: string,
    },
  },
};

const TripBuilder = ({ navigation, route }: TripBuilderProps): Node => {
  const trip = useTrip(route.params?.documentPath);
  const defaultValues = useDefaultValues(trip.data);
  const aircraft = useExistingAircraft();

  if (trip.loading || aircraft.loading) {
    return (
      <Box flex={1}>
        <ScreenLoader />
      </Box>
    );
  }

  return (
    <TripBuilderForm
      navigation={navigation}
      defaultValues={defaultValues}
      aircraftOptions={aircraft.data}
      doc={trip.snapshot?.ref}
    />
  );
};

const TripBuilderForm = ({
  navigation,
  defaultValues,
  aircraftOptions,
  doc,
}): Node => {
  const tripRef = useRef(doc);
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    getValues,
    setValue,
    reset,
  } = useForm({ defaultValues });

  const { fields, insert, remove, update } = useFieldArray({
    control,
    name: 'trip.legs',
  });

  const { isDirty, isSubmitting, isSubmitSuccessful, errors } = useFormState({
    control,
  });

  const [newLegIndex, setNewLegIndex] = useState(-1);

  const submit = useSubmitCallback({ tripRef, setError, handleSubmit });

  const goToPassengers = useCallback(
    async params => {
      let identifier;
      const legs = getValues('trip.legs');
      const passengers = _.chain(legs)
        .map('passengers')
        .flatten()
        .uniqBy('name')
        .value();

      if (tripRef.current) {
        const snap = await tripRef.current.get();
        identifier = snap.get('identifier');
      }

      navigation.navigate('Trip Passengers', {
        identifier,
        customName: getValues('trip.customName'),
        passengers,
        onSave: updatedPassengers => {
          setValue(
            'trip.legs',
            legs.map(l => ({ ...l, passengers: updatedPassengers })),
          );
        },
        ...params,
      });
    },
    [getValues, navigation, setValue],
  );

  useBuilderHeader({ isDirty, navigation, submit, isSubmitting });

  useEffect(() => {
    if (newLegIndex > -1) {
      insert(newLegIndex, getNewLeg(newLegIndex - 1, getValues('trip.legs')));
      setNewLegIndex(-1);
    }
  }, [getValues, insert, newLegIndex]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset(getValues());
    }
  }, [getValues, isSubmitSuccessful, reset]);

  const dialog = useConfirmationLeaving({ navigation, submit, isDirty });

  return (
    <MobileView>
      <ScreenLayout color={theme.colors.background}>
        {dialog}
        <Spacer size={2} />
        <Row>
          <TextFormField
            width={344}
            label="Trip Name"
            name="trip.customName"
            control={control}
          />
        </Row>
        <Row>
          <DropdownContainer>
            <DropdownFormField
              control={control}
              name="trip.aircraft"
              label="Aircraft"
              options={aircraftOptions}
              keyPath="tailNumber"
              rules={{
                validate: {
                  required: craft =>
                    Boolean(craft?.tailNumber) || 'Please select an Aircraft.',
                },
              }}
              renderLabel={craft =>
                [craft?.tailNumber, craft?.name, craft?.type]
                  .filter(Boolean)
                  .join(' - ')
              }
            />
          </DropdownContainer>
        </Row>
        <Spacer size={2} />
        <Box dir="row" ph={1.75}>
          <Controller
            name="trip.notes"
            control={control}
            render={({ field }) => (
              <TripNotesButton
                height={56}
                flex={1}
                notes={field.value}
                onSave={text => {
                  field.onChange(text);
                  submit();
                }}
              />
            )}
          />
          <Spacer size={2} dir="horizontal" />
          <BorderedButton height={56} flex={1} onPress={goToPassengers}>
            PASSENGERS
          </BorderedButton>
        </Box>
        {fields.map((leg, index) => (
          <TripBuilderLeg
            key={leg.id}
            id={leg.id}
            control={control}
            index={index}
            required={index === 0}
            legs={fields}
            insert={setNewLegIndex}
            remove={remove}
            onPassengerEdit={() =>
              goToPassengers({
                passengers: leg?.passengers,
                legName: `Leg ${index + 1}`,
                onSave: passengers => update(index, { ...leg, passengers }),
              })
            }
          />
        ))}

        <Box width="100%" mt={1} ph={1.5}>
          <SecondaryButton
            loading={isSubmitting}
            padding={1}
            onPress={async () => {
              await submit();

              navigation.navigate('Trip Review', {
                documentPath: tripRef.current.path,
              });
            }}>
            {isSubmitting && 'Saving Draft...'}
            {!isSubmitting && 'Review Trip'}
          </SecondaryButton>
        </Box>

        <Notification
          color="error"
          visible={errors?.general}
          onDismiss={() => clearErrors()}>
          {errors?.general?.message}
        </Notification>
      </ScreenLayout>
    </MobileView>
  );
};

const useDefaultValues = trip =>
  useMemo(
    () => ({
      trip: {
        customName: trip.customName || '',
        notes: trip.notes || '',
        aircraft: { tailNumber: trip.aircraft?.tailNumber },
        legs: _.isEmpty(trip.legs)
          ? [emptyLeg]
          : trip.legs.map(leg => ({
              ...leg,
              departureDate: leg.departureDate.toJSDate(),
              date: leg.departureDate.toJSDate(),
              time: leg.departureDate.toJSDate(),
              timeZone: getZoneInformation(leg.departureDate)?.abbreviation,
            })),
      },
    }),
    [trip.aircraft, trip.customName, trip.legs, trip.notes],
  );

const useSubmitCallback = ({ tripRef, setError, handleSubmit }) =>
  handleSubmit(
    useCallback(
      async tripData => {
        try {
          tripRef.current = await saveTrip(tripData.trip, tripRef.current);
        } catch (error) {
          setError('general', { type: 'manual', message: error.message });
        }
      },
      [setError, tripRef],
    ),
  );

const useBuilderHeader = ({ navigation, isSubmitting, submit }) => {
  useEffect(() => {
    const params = {
      headerRight: () => (
        <Button loading={isSubmitting} mode="text" onPress={submit}>
          Save
        </Button>
      ),
    };
    navigation.setOptions(params);
  }, [isSubmitting, navigation, submit]);
};

const useConfirmationLeaving = ({ navigation, isDirty, submit }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [buttons, setButtons] = useState(() => [
    { label: 'CLOSE', onPress: () => setDialogVisible(false) },
  ]);

  useEffect(() => {
    const tabNav = navigation.getParent();
    const closeDialog = () => setDialogVisible(false);

    const removeTabBlur = tabNav.addListener('blur', () => {
      if (isDirty) {
        setDialogVisible(true);

        setButtons([
          {
            label: 'CONTINUE WITHOUT SAVING',
            onPress: () => {
              closeDialog();
            },
          },
          {
            label: 'SAVE',
            async onPress() {
              closeDialog();
              submit();
            },
          },
        ]);
      } else {
        navigation.popToTop();
      }
    });

    const removeOnBack = navigation.addListener('beforeRemove', e => {
      if (isDirty) {
        e.preventDefault();
        setDialogVisible(true);

        const continueNav = () => navigation.dispatch(e.data.action);

        setButtons([
          {
            label: 'CANCEL',
            onPress: () => {
              closeDialog();
            },
          },
          {
            label: 'DISCARD CHANGES',
            onPress: () => {
              closeDialog();
              continueNav();
            },
          },
          {
            label: 'SAVE',
            async onPress() {
              closeDialog();
              submit();
              continueNav();
            },
          },
        ]);
      }
    });

    return () => {
      removeTabBlur();
      removeOnBack();
    };
  }, [isDirty, navigation, dialogVisible, submit]);

  const dialog = (
    <ConfirmationDialog
      text="Do you want to save updates made to the trip?"
      visible={dialogVisible}
      buttons={buttons}
    />
  );

  return dialog;
};

const Row = styled(View)`
  flex-direction: row;
  width: 100%;
  justify-content: center;
`;

const DropdownContainer = styled(View)(({ theme }) => ({
  width: 344,
  margin: 8,
}));

export default TripBuilder;
