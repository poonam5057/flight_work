import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native';
import styled from '@emotion/native';
import Dialog from '../../../../components/Dialog';
import Button from '../../../../components/Button';
import Text from '../../../../components/Text';
import PassengerList, {
  usePassengerListControl,
} from '../../../components/PassengerList';
import SearchField from '../../../../components/SearchField';
import TextField from '../../../../components/TextField';
import { useAsyncCallback } from 'react-async-hook';

const EditTripInfo = ({
  trip,
  aircraftOptions,
  pilotOptions,
  visible,
  onDismiss,
}) => {
  const [data, setData] = useState(trip);

  const changePassengers = useCallback(
    (leg, passengers) =>
      setData(existingInformation => ({
        ...existingInformation,
        legs: existingInformation.legs.map(existingLeg => {
          if (existingLeg.id === leg.id) {
            existingLeg.passengers = passengers;
          }

          return existingLeg;
        }),
      })),
    [],
  );

  const { addPassenger, removePassenger, replacePassenger, allPassengers } =
    usePassengerListControl({ legs: data?.legs, changePassengers });

  const changeTailNumber = useCallback(
    ({ tailNumber }) => {
      const type = aircraftOptions.find(a => tailNumber === a.tailNumber)?.type;

      setData(existing => ({
        ...existing,
        aircraft: { ...existing.aircraft, tailNumber, type },
      }));
    },
    [aircraftOptions],
  );

  const onSave = useAsyncCallback(async () => {
    await saveTrip(data);
    onDismiss();
  }, [data, onDismiss]);

  return (
    <Dialog
      title="Edit Trip Info"
      visible={visible}
      onDismiss={onDismiss}
      dismissable={false}
      actionSlot={
        <>
          <Button color="disabled" onPress={onDismiss}>
            Cancel
          </Button>
          <Button ml={1} onPress={onSave.execute}>
            Save
          </Button>
        </>
      }>
      <SafeAreaView>
        <FieldWrap>
          <FieldLabel>Tail #</FieldLabel>
          <SearchableField
            value={{ name: data?.aircraft?.tailNumber }}
            label="Select Tail #"
            options={aircraftOptions.map(a => ({ ...a, name: a.tailNumber }))}
            onChange={changeTailNumber}
          />
        </FieldWrap>
        <FieldWrap>
          <FieldLabel>Aircraft Type</FieldLabel>
          <FieldText>{data?.aircraft?.type}</FieldText>
        </FieldWrap>
        <FieldWrap>
          <FieldLabel>Trip Name</FieldLabel>
          <TextField
            light
            wrapStyle={FIELD_STYLES}
            label="Add Trip Name"
            value={data.name}
            onChangeText={name => setData(existing => ({ ...existing, name }))}
          />
        </FieldWrap>
        <FieldWrap>
          <FieldLabel>Pilot in Command</FieldLabel>
          <SearchableField
            value={data.aircraft.firstPilot}
            label="Select Pilot"
            options={pilotOptions}
            onChange={firstPilot =>
              setData(existing => ({ ...existing, firstPilot }))
            }
          />
        </FieldWrap>
        <FieldWrap>
          <FieldLabel>Second Pilot</FieldLabel>
          <SearchableField
            value={data.aircraft.secondPilot}
            label="Select Pilot"
            options={pilotOptions}
            onChange={secondPilot =>
              setData(existing => ({ ...existing, secondPilot }))
            }
          />
        </FieldWrap>
        <FieldWrap>
          <FieldLabel style={{ alignSelf: 'flex-start' }}>
            Passengers
          </FieldLabel>
          <PassengerList
            numColumns={1}
            passengers={allPassengers}
            onAdd={addPassenger}
            onRemove={removePassenger}
            onReplace={replacePassenger}
          />
        </FieldWrap>
        <FieldWrap>
          <FieldLabel>Notes</FieldLabel>
          <TextField
            light
            wrapStyle={FIELD_STYLES}
            label="Add Notes"
            value={data.notes}
            multiline
            onChangeText={notes =>
              setData(existing => ({ ...existing, notes }))
            }
          />
        </FieldWrap>
      </SafeAreaView>
    </Dialog>
  );
};

const SearchableField = ({ label, value, options = [], onChange }) => (
  <SearchField
    placeholder={label}
    defaultValue={value}
    options={options}
    getOptionLabel={o => o.name}
    getOptionValue={o => o.name}
    onChange={onChange}
    style={[FIELD_STYLES]}
  />
);

const saveTrip = async payload => {
  console.log(payload);

  return true;
};

const FIELD_STYLES = { width: 280, marginBottom: 0 };

const FieldWrap = styled.View(({ theme }) => ({
  alignItems: 'center',
  flexDirection: 'row',
  paddingHorizontal: theme.layout.space(2.5),
  marginBottom: theme.layout.space(1.125),
}));

const FieldLabel = styled(Text)(({ theme }) => ({
  width: 174,
  paddingHorizontal: theme.layout.space(0.75),
  marginTop: theme.layout.space(0.5),
}));

const FieldText = styled(Text)(({ theme }) => ({
  marginTop: theme.layout.space(0.5),
}));

FieldText.defaultProps = { size: 'medium', color: 'dark' };

export default EditTripInfo;
