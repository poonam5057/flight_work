/**
 * @file
 * Components used on the aircraft screens
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import _ from 'lodash';
import { Box } from '@appComponents/ScreenLayout';
import Text from '@appComponents/Text';

export const Row = ({ label, value, children, sizes, ...rest }) => {
  const [w1 = '40%', w2 = '55%'] = sizes ?? [];
  return (
    <Box
      dir="row"
      width="100%"
      mv={1}
      jc="space-between"
      ai="stretch"
      {...rest}>
      <Box width={w1}>
        <Text size="smallest" weight="bold">
          {label.toUpperCase()}
        </Text>
      </Box>
      <Box width={w2}>{value ? <Text>{value}</Text> : children}</Box>
    </Box>
  );
};
