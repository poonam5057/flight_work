/**
 * @file
 * Owner/Pilot status component
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import styled from '@emotion/native';
import { Chip } from 'react-native-paper';
import _ from 'lodash';

import type { FlightWorksTheme } from '@appComponents/theme/createTheme';
import { useTheme } from '@appComponents/theme';

type StatusProps = {
  status: string,
  mapStatusToColor: FlightWorksTheme => string,
};

const Status = ({ status, mapStatusToColor, ...rest }: StatusProps) => {
  const theme = useTheme();
  const mapping = mapStatusToColor(theme);
  const color = _.get(mapping, status, theme.colors.text);

  return (
    <StatusChip icon="check" mode="outlined" selectedColor={color} {...rest}>
      {status.replace('Manager ', '')}
    </StatusChip>
  );
};

const StatusChip: typeof Chip = styled(Chip)(({ theme }) => ({
  borderRadius: 4,
  backgroundColor: 'transparent',
  pointerEvents: 'none',
}));

export default Status;
