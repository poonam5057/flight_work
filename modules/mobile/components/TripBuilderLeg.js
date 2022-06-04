/**
 * @file
 * A component for adding or editing leg information
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { View } from 'react-native';
import { Divider } from 'react-native-paper';
import { DialogDateTimeFormField } from '@appComponents/forms/FormFields';
import styled from '@emotion/native';
import Text from '@appComponents/Text';
import Button from '@appComponents/Button';
import DropdownFormField from './DropdownFormField';
import { Box, Spacer } from '@appComponents/ScreenLayout';
import { ControlledLegInput } from '@appComponents/forms/LegInputField';

const MAX_LEGS = 7;

const timeZones = ['EST', 'CST', 'MST', 'PST'];

const TripBuilderLeg = ({
  id,
  control,
  index,
  legs,
  insert,
  remove,
  onPassengerEdit,
  required,
}) => {
  const numLegs = legs.length;

  return (
    <Box width="100%" mb={3} ph={2} key={id}>
      <LegDivider />
      <Header>
        <LegHeader size="medium" weight="400">
          LEG {index + 1}
        </LegHeader>
        {numLegs < MAX_LEGS && (
          <AddLegButton onPress={() => insert(index + 1)}>Add Leg</AddLegButton>
        )}
        {numLegs > 1 && <RemoveLegButton onPress={() => remove(index)} />}
      </Header>
      <Row>
        <Box flex={1}>
          <ControlledLegInput
            label="From"
            name={`trip.legs.${index}.from`}
            rules={{ required: required && 'Please fill in at least one leg.' }}
            control={control}
          />
        </Box>
        <Spacer dir="horizontal" size={2} />
        <Box flex={1}>
          <ControlledLegInput
            label="To"
            name={`trip.legs.${index}.to`}
            rules={{ required }}
            control={control}
          />
        </Box>
      </Row>
      <Row>
        <DialogDateTimeFormField
          control={control}
          mode="date"
          label="Departure Date"
          name={`trip.legs.${index}.date`}
        />
      </Row>
      <Row mb={1}>
        <Box flex={1}>
          <DialogDateTimeFormField
            control={control}
            mode="time"
            label="Departure Time"
            name={`trip.legs.${index}.time`}
          />
        </Box>
        <Spacer dir="horizontal" size={2} />
        <Box flex={1}>
          <DropdownFormField
            control={control}
            name={`trip.legs.${index}.timeZone`}
            label="Time Zone"
            options={timeZones}
          />
        </Box>
      </Row>
      <Row mb={1}>
        <UnderlinedButton
          color="secondary"
          mode="text"
          onPress={onPassengerEdit}>
          Edit Leg Passengers
        </UnderlinedButton>
      </Row>
    </Box>
  );
};

const Row: typeof Box = styled(Box)(({ theme, mb }) => ({
  flexDirection: 'row',
  marginBottom: Number.isFinite(mb) ? undefined : theme.layout.space(3),
}));

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  width: 100%;
`;

const LegHeader = styled(Text)(({ theme }) => ({
  color: theme.colors.legLabel,
  marginLeft: 16,
}));

const LegDivider = styled(Divider)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  height: 1,
  marginTop: theme.layout.space(4),
  marginBottom: theme.layout.space(2),
}));

const AddLegButton = styled(Button)(({ theme }) => ({
  color: theme.colors.secondary,
}));

AddLegButton.defaultProps = {
  mode: 'text',
  icon: 'add',
  iconSize: 20,
  color: 'secondary',
  labelStyle: { marginLeft: 8, fontWeight: '700' },
};

const RemoveLegButton = styled(Button)(({ theme }) => ({
  marginLeft: 'auto',
  marginRight: theme.layout.space(2),
}));

RemoveLegButton.defaultProps = {
  mode: 'text',
  icon: 'close',
  iconSize: 20,
  color: 'text',
};

const UnderlinedButton = styled(Button)(({ theme, color }) => ({
  borderBottomColor: theme.colors[color],
  borderBottomWidth: 1,
}));

UnderlinedButton.defaultProps = {
  labelStyle: {
    marginHorizontal: 2,
    marginVertical: 4,
    fontWeight: '700',
    lineHeight: 20,
  },
};

export default TripBuilderLeg;
