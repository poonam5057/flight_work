/**
 * @file
 * Our custom App Radio Button
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import type { Node } from 'react';
import { RadioButton } from 'react-native-paper';

const Radio = ({ checked, onChange, ...rest }: RadioProps): Node => (
  <RadioButton.Item
    status={checked ? 'checked' : 'unchecked'}
    onPress={onChange}
    position="leading"
    mode="android"
    {...rest}
  />
);

type RadioProps = {
  /**
   * Value of the radio button
   */
  value: string,
  /**
   * Label of the radio button
   */
  label?: string,
  /**
   * Whether radio is checked
   */
  checked?: boolean,
  /**
   * Whether radio is disabled
   */
  disabled?: boolean,
  /**
   * Function to execute on press
   */
  onChange?: Function,
};

export default Radio;
