/**
 * @file
 * Datetime preview component
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { DateTime } from 'luxon';
import { rawTimeZones, RawTimeZone } from '@vvo/tzdb';
import _ from 'lodash';

type DateViewProps = {
  date?: DateTime,
  fallback?: string,
};

export const DateView = (props: DateViewProps) => {
  if (!props.date) {
    return props.fallback;
  }

  return <>{props.date.toLocaleString(DateTime.DATE_SHORT)}</>;
};

export const TimeView = (props: DateViewProps) => {
  if (!props.date) {
    return props.fallback;
  }

  const zone = getZoneInformation(props.date);

  return (
    <>
      {props.date.toLocaleString(DateTime.TIME_SIMPLE)} {zone?.abbreviation}
    </>
  );
};

export const getZoneInformation = (date: DateTime): RawTimeZone =>
  zones.get(date.zoneName);

const zones = new Map(
  _.map(rawTimeZones, z => [z.name, z]).concat([
    ['UTC', { abbreviation: 'UTC' }],
    ['utc', { abbreviation: 'UTC' }],
  ]),
);
