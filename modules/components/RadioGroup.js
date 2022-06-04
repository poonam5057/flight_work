/**
 * @file
 * Our custom App Radio Button Group
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import type { Node } from 'react';
import { HelperText, RadioButton } from 'react-native-paper';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Radio from './Radio';

const RadioGroup = ({
  options,
  value,
  disabled,
  color,
  onChange,
  errorMessage,
  style,
  labelStyle,
}: RadioGroupProps): Node => {
  return (
    <RadioButton.Group value={value} onValueChange={onChange}>
      {options.map(option => (
        <Radio
          key={option.value}
          label={option.label}
          style={[styles.container, style]}
          labelStyle={[styles.label, labelStyle]}
          value={option.value}
          disabled={disabled}
          color={color}
        />
      ))}
      {Boolean(errorMessage) && (
        <HelperText type="error" visible>
          {errorMessage}
        </HelperText>
      )}
    </RadioButton.Group>
  );
};

type RadioGroupProps = {
  /**
   * Radio Options
   */
  options: Array<{
    /**
     * Value of the radio option
     */
    value: string,
    /**
     * Label of the radio option
     */
    label: string,
  }>,
  /**
   * Current/Selected value of the radio group
   */
  value: string,
  /**
   * Radio button color
   */
  color?: string,
  /**
   * Function to execute on value change
   */
  onChange: Function,
  /**
   * Whether radio group is disabled
   */
  disabled?: boolean,
  /**
   * Error message for showing in helper text
   */
  errorMessage?: string,

  /**
   * Child item container style
   */
  style?: ViewStyle,

  /**
   * Child item text style
   */
  labelStyle?: TextStyle,
};

const styles = StyleSheet.create({
  label: {
    textAlign: 'left',
    textTransform: 'uppercase',
    fontSize: 14,
  },
  container: {
    paddingLeft: 0,
  },
});

export default RadioGroup;
