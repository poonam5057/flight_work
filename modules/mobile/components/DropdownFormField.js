/**
 * @file
 * Drop-Down form field
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback, useMemo, useState } from 'react';
import DropDown from 'react-native-paper-dropdown';
import { HelperText } from 'react-native-paper';
import { Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import _ from 'lodash';

import { useTheme } from '@appComponents/theme';

type DropDownFieldProps<Item> = {
  control: Object,
  label: string,
  name: string,
  rules?: Object,
  options?: Item[],
  renderLabel?: Item => string,
  keyPath?: string | string[],
};

const DropdownFormField = (props: DropDownFieldProps): Node => (
  <Controller
    control={props.control}
    name={props.name}
    rules={props.rules}
    render={({ field: { onChange, value }, fieldState }) => (
      <>
        <DropDownField
          label={props.label}
          value={value}
          onChange={onChange}
          options={props.options}
          keyPath={props.keyPath}
          renderLabel={props.renderLabel}
          error={fieldState.invalid}
        />
        {Boolean(fieldState.invalid) && (
          <HelperText type="error" visible>
            {fieldState.error?.message}
          </HelperText>
        )}
      </>
    )}
  />
);

DropdownFormField.defaultProps = {
  renderLabel: item =>
    _.isObject(item) ? item.label || item.title || item.name : item,
};

const DropDownField = ({ onChange, value, options, error, ...props }) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const keyExtractor = useKeyExtractor(props.keyPath);
  const renderOptionLabel = props.renderLabel;

  const styles = useStyles(error);

  // Append value when it's not part of available options
  if (_.every(options, o => _.isMatch(o, value) === false)) {
    options = options.concat([value]);
  }

  const formattedOptions = useMemo(
    () =>
      _.map(options, o => ({
        label: renderOptionLabel(o),
        value: keyExtractor(o),
      })),
    [keyExtractor, options, renderOptionLabel],
  );

  const update = useCallback(
    selected => {
      const index = formattedOptions.findIndex(o => selected === o.value);
      onChange(options[index]);
    },
    [formattedOptions, onChange, options],
  );

  return (
    <DropDown
      label={props.label}
      mode="outlined"
      visible={showDropDown}
      showDropDown={() => setShowDropDown(true)}
      onDismiss={() => setShowDropDown(false)}
      value={value ? keyExtractor(value) : ''}
      setValue={update}
      list={formattedOptions}
      inputProps={{
        error,
      }}
      {...styles}
    />
  );
};

const useStyles = error => {
  const rootTheme = useTheme();
  return useMemo(() => {
    const itemStyle = StyleSheet.create({
      borderColor: rootTheme.colors.placeholder,
      borderBottomWidth: 0.5,
      borderTopWidth: 0.5,
    });

    const theme = {
      ...rootTheme,
      colors: {
        ...rootTheme.colors,
        background: rootTheme.colors.fieldBackground,
        placeholder: error
          ? rootTheme.colors.error
          : rootTheme.colors.placeholder,
      },
    };

    return {
      theme,
      dropDownItemStyle: itemStyle,
      dropDownItemSelectedStyle: itemStyle,
    };
  }, [error, rootTheme]);
};

const useKeyExtractor = path =>
  useCallback(item => (path ? _.get(item, path) : keyExtractor(item)), [path]);

const keyExtractor = item =>
  _.isObject(item) ? item.key || item.id || item.value : item;

export default DropdownFormField;
