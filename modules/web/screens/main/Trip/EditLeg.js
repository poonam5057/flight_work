import React, { useCallback, useState } from 'react';
import styled from '@emotion/native';
import Dialog from '../../../../components/Dialog';
import Button from '../../../../components/Button';
import Text from '../../../../components/Text';
import LegEdit from '../../../components/LegEdit';
import { Spacer } from '../../../../components/ScreenLayout';
import { useAsyncCallback } from 'react-async-hook';
import { DateTime } from 'luxon';
import TextField from '../../../../components/TextField';
import { TextInput } from 'react-native-paper';
import PassengerList, {
  usePassengerListControl,
} from '../../../components/PassengerList';

const EditLeg = ({ leg, legIndex, visible, onDismiss }) => {
  const initialValues = {
    ...(leg
      ? { ...leg, departureDate: DateTime.fromISO(leg.departureDate) }
      : LEG_DEFAULT_VALUES),
  };

  const [data, setData] = useState(initialValues);

  const changePassengers = useCallback(
    (currentLeg, passengers) =>
      setData(existingInformation => ({ ...existingInformation, passengers })),
    [],
  );

  const onSave = useAsyncCallback(async () => {
    await saveLeg(data);
    onDismiss();
  }, [data, onDismiss]);

  const { addPassenger, removePassenger, replacePassenger } =
    usePassengerListControl({ legs: [data], changePassengers });

  return (
    <Dialog
      title={`${!leg ? 'Add' : 'Edit'} Leg`}
      visible={visible}
      onDismiss={onDismiss}
      dismissable={false}
      style={{ maxWidth: 920 }}
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
      <LegEdit leg={data} index={legIndex} onChange={setData} />
      <Spacer size={2} />
      <FuelForm data={data} setData={setData} />
      <Spacer size={2} />

      <Text color="dark" weight={500}>
        PASSENGERS
      </Text>
      <PassengerList
        numColumns={1}
        passengers={data?.passengers}
        onAdd={addPassenger}
        onRemove={removePassenger}
        onReplace={replacePassenger}
        leadPassenger={data?.leadPassenger}
        setLead={leadPassenger =>
          setData(existing => ({ ...existing, leadPassenger }))
        }
      />
    </Dialog>
  );
};

const FuelForm = ({ data, setData }) => {
  const onChange = useCallback(
    value => {
      setData(existing => ({
        ...existing,
        ...value,
      }));
    },
    [setData],
  );

  return (
    <FieldWrap>
      <TextField
        light
        wrapStyle={FIELD_STYLES}
        label="Fuel On"
        right={<TextInput.Affix text="lbs" />}
        value={data.fuelOn}
        onChangeText={fuelOn => onChange({ fuelOn })}
      />
      <TextField
        light
        wrapStyle={FIELD_STYLES}
        label="Fuel Off"
        right={<TextInput.Affix text="lbs" />}
        value={data.fuelOff}
        onChangeText={fuelOff => onChange({ fuelOff })}
      />
      <TextField
        light
        wrapStyle={FIELD_STYLES}
        label="Fuel Used"
        right={<TextInput.Affix text="lbs" />}
        value={getFuelUsedValue(data)}
        onChangeText={fuelUsed => onChange({ fuelUsed })}
      />
    </FieldWrap>
  );
};

const FIELD_STYLES = { width: 200, marginBottom: 0, marginRight: 24 };

const LEG_DEFAULT_VALUES = {
  from: '',
  to: '',
  departureDate: DateTime.now().startOf('minute'),
  passengers: [],
  leadPassenger: {},
  fuelOn: '',
  fuelOff: '',
  fuelUsed: '',
};

const getFuelUsedValue = data => {
  if (data?.fuelUsed?.length) {
    return data?.fuelUsed;
  }

  if (data?.fuelOn && data?.fuelOff) {
    return data.fuelOn - data.fuelOff;
  }

  return '';
};

const saveLeg = async payload => {
  console.log(payload);

  return true;
};

const FieldWrap = styled.View(() => ({
  alignItems: 'center',
  flexDirection: 'row',
}));

const FieldText = styled(Text)(({ theme }) => ({
  marginTop: theme.layout.space(0.5),
}));

FieldText.defaultProps = { size: 'medium', color: 'dark' };

export default EditLeg;
