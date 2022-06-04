/**
 * @file
 * Our custom App Checkbox
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import type { Node } from 'react';
import { Checkbox as NativeCheckbox } from 'react-native-paper';

const Checkbox = ({
  checked,
  onChange,
  label,
  ...rest
}: CheckboxProps): Node => {
  if (label) {
    return (
      <NativeCheckbox.Item
        status={checked ? 'checked' : 'unchecked'}
        onPress={onChange}
        position="leading"
        label={label}
        mode="android"
        {...rest}
      />
    );
  }

  return (
    <NativeCheckbox
      status={checked ? 'checked' : 'unchecked'}
      onPress={onChange}
      {...rest}
    />
  );
};

type CheckboxProps = {
  /**
   * Label of the checkbox
   */
  label?: string,
  /**
   * Whether checkbox is checked
   */
  checked?: boolean,
  /**
   * Whether checkbox is disabled
   */
  disabled?: boolean,
  /**
   * Function to execute on press
   */
  onChange?: Function,
};

Checkbox.defaultProps = {
  color: '#40AFED',
};

export default Checkbox;
