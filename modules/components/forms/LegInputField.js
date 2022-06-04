/**
 * @file
 * Component used for selecting a Trip leg
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { TextInput } from 'react-native-paper';
import { Controller } from 'react-hook-form';
import TextField, { useColors } from '../TextField';

const LegInputField: typeof TextInput = ({ onChangeText, ...rest }) => {
  const { outline, ...colors } = useColors(rest);

  return (
    <TextField
      theme={{ colors }}
      mode="outlined"
      autoCapitalize="characters"
      maxLength={4}
      onChangeText={(text = '') => onChangeText(text.toUpperCase())}
      {...rest}
    />
  );
};

export const ControlledLegInput = ({
  label,
  name,
  control,
  rules,
  ...rest
}): Node => (
  <Controller
    control={control}
    name={name}
    shouldUnregister={false}
    rules={rules}
    render={({ field: { onChange, value, onBlur }, fieldState }) => (
      <LegInputField
        label={label}
        value={value}
        onBlur={onBlur}
        onChangeText={onChange}
        error={fieldState.invalid}
        errorMessage={fieldState.error?.message}
        {...rest}
      />
    )}
  />
);

export default LegInputField;
