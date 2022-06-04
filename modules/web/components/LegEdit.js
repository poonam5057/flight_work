/**
 * @file
 * A component for adding or editing leg information
 *
 * @format
 * @flow strict-local
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAsync } from 'react-async-hook';
import { DateTime } from 'luxon';

import DateTimeField from '@appComponents/DateTimeField';
import { useTheme } from '@appComponents/theme';
import LegInputField from '@appComponents/forms/LegInputField';

type LegProps = {
  leg: LegItem,
  onChange: LegItem => void,
  prevDeparture?: DateTime,
  autoTimezone?: boolean,
  style?: StyleSheet,
};

export type LegItem = {
  from: string,
  to: string,
  departureDate: Date,
};

const Leg = ({
  leg,
  onChange,
  onSubmit,
  prevDeparture,
  autoTimezone,
  style,
}: LegProps) => {
  const { loading } = useAutoLegTz(leg, autoTimezone, onChange);
  const styles = useStyles();

  return (
    <View style={[styles.layout, style]}>
      <LegInputField
        dense
        label="Departure Airport"
        value={leg.from}
        autoFocus={!leg.from}
        onChangeText={text => onChange({ from: text })}
        onSubmitEditing={onSubmit}
        blurOnSubmit={false}
        style={[styles.field, styles.airportField, styles.gap]}
      />
      <LegInputField
        dense
        label="Arrival Airport"
        value={leg.to}
        autoFocus={Boolean(leg.from)}
        onChangeText={text => onChange({ to: text })}
        onSubmitEditing={onSubmit}
        blurOnSubmit={false}
        style={[styles.field, styles.airportField, styles.gap]}
      />
      <DateTimeField
        dense
        label="Departure Date*"
        value={leg.departureDate}
        onChange={date => onChange({ departureDate: date })}
        onSubmitEditing={onSubmit}
        minDate={prevDeparture}
        fieldStyles={[styles.field, styles.gap]}
        disabled={loading}
      />
    </View>
  );
};

const useAutoLegTz = (leg, autoTimezone, update) => {
  const asyncItem = useAsync(
    async from => {
      if (autoTimezone && from?.length >= 3) {
        const response = await fetch(
          'https://raw.githubusercontent.com/hroptatyr/dateutils/tzmaps/iata.tzmap',
        );
        const asText = await response.text();
        const re = new RegExp(`(?<=^${from}\\s).+`, 'mg');
        const [tz = ''] = re.exec(asText) ?? [];

        if (tz && tz !== leg.departureDate.zoneName) {
          update({ departureDate: leg.departureDate.setZone(tz) });
        }
      }
    },
    [leg?.from],
  );

  return asyncItem;
};

const useStyles = () => {
  const theme = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        layout: {
          flexDirection: 'row',
          width: '95%',
        },
        field: {
          backgroundColor: theme.colors.surface,
        },
        airportField: {
          flex: 1,
        },
        gap: {
          marginRight: theme.layout.gap(4),
        },
      }),
    [theme.colors.surface, theme.layout],
  );
};

export default Leg;
