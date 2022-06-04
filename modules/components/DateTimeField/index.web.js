/**
 * @file
 * Datetime input component used on Web
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/native';
import { Menu, TextInput, List } from 'react-native-paper';
import { TextInput as NativeInput } from 'react-native';
import type { ViewStyle } from 'react-native';
import { DateTime } from 'luxon';
import { rawTimeZones } from '@vvo/tzdb';
import _ from 'lodash';
import Icon from '@appComponents/theme/Icon';

type DateTimeProps = {
  label: string,
  value: DateTime,
  onChange: DateTime => void,
  onSubmitEditing?: ({ nativeEvent: Object }) => void,
  maxDate?: DateTime,
  minDate?: DateTime,
  fieldStyles?: ViewStyle,
  style?: ViewStyle,
  dense?: boolean,
};

const DateTimeField = ({
  label,
  value,
  onChange,
  onSubmitEditing,
  minDate,
  maxDate,
  fieldStyles,
  style,
  dense,
}: DateTimeProps) => {
  const dateRef = useRef();

  useEffect(() => {
    dateRef.current?.setNativeProps({
      type: 'datetime-local',
      text: getIsoString(value),
    });
  }, [value]);

  const updateTimezone = useCallback(
    timeZone => {
      const next = value.setZone(timeZone, { keepLocalTime: true });
      onChange(next);
    },
    [onChange, value],
  );

  const updateDate = useCallback(
    text => {
      const next = DateTime.fromISO(text, { zone: value.zone });
      next.setZone(value.zone);

      if (next.isValid) {
        onChange(next);
      }
    },
    [onChange, value.zone],
  );

  return (
    <FieldWrap style={style}>
      <DateInput
        label={label}
        ref={dateRef}
        value=" " // force minimized label
        onChangeText={updateDate}
        onSubmitEditing={onSubmitEditing}
        error={Boolean(value?.invalid) || value < minDate || value > maxDate}
        style={fieldStyles}
        dense={dense}
      />

      <TimezoneField
        label="Timezone"
        date={value}
        onChange={updateTimezone}
        onSubmitEditing={onSubmitEditing}
        style={fieldStyles}
        dense={dense}
      />
    </FieldWrap>
  );
};

const TimezoneField = ({ date, onChange, onSubmitEditing, style, dense }) => {
  const [abbreviated, setAbbreviated] = useState(date.offsetNameShort);

  useEffect(() => {
    setAbbreviated(current => findTzAbbreviation(date.zoneName) ?? current);
  }, [date.zoneName]);

  const updateZone = useCallback(
    (text = '') => {
      text = text.toUpperCase();
      setAbbreviated(text);
      if (text.length >= 3) {
        const zone = rawTimeZones.find(tz => tz.abbreviation === text);
        if (zone && zone.name !== date.zoneName) {
          onChange(zone.name);
        }
      }
    },
    [date, onChange],
  );

  return (
    <TimeZoneInput
      mode="outlined"
      label="Timezone"
      value={abbreviated}
      onChangeText={updateZone}
      onSubmitEditing={onSubmitEditing}
      blurOnSubmit={false}
      maxLength={6}
      error={
        abbreviated.length >= 3 &&
        rawTimeZones.every(tz => tz.abbreviation !== abbreviated)
      }
      style={style}
      dense={dense}
      right={useTzAdornment(date)}
      ref={el => el?.setNativeProps({ title: date?.offsetNameLong })}
    />
  );
};

export const useTzAdornment = date => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <TextInput.Icon
      forceTextInputFocus={false}
      onPress={() => setTooltipVisible(current => !current)}
      name={iconProps => {
        return (
          <Menu
            visible={tooltipVisible}
            onDismiss={() => setTooltipVisible(false)}
            anchor={<Icon name="help" {...iconProps} />}>
            <List.Section title="Timezone Information">
              <List.Item
                description="Offset Name"
                title={date.offsetNameLong}
              />
              <List.Item
                description="Current Local Time"
                title={DateTime.now()
                  .setZone(date.zone)
                  .toLocaleString(DateTime.TIME_SIMPLE)}
              />
            </List.Section>
          </Menu>
        );
      }}
    />
  );
};

const getIsoString = (date: DateTime) =>
  date.startOf('minute').toISO({ includeOffset: false, suppressSeconds: true });

const findTzAbbreviation = timeZone =>
  rawTimeZones.find(tz => tz.name === timeZone)?.abbreviation;

const FieldWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
`;

const TimeZoneInput = styled(TextInput)`
  width: 120px;
`;

const DateInput = styled(TextInput)`
  min-width: 180px;
  margin-right: ${({ theme }) => theme.layout.gap(2).toString()}px;
`;

DateInput.defaultProps = {
  mode: 'outlined',
  blurOnSubmit: false,
  /**
   * We're forcing an uncontrolled component since we're not setting the string
   * used here from outside but only internally
   */
  render: props => <NativeInput {..._.omit(props, ['value'])} />,
};

export default DateTimeField;
