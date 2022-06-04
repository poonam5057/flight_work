/**
 * @file
 * Reusable table cell components
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import _ from 'lodash';

import { Cell, DataTable, PlainCell } from '@appComponents/DataTable';
import Text, { PersonText } from '@appComponents/Text';
import { Box } from '@appComponents/ScreenLayout';
import * as Phone from '@appUtils/phone';

export { Cell, PlainCell };

type TableProps = {
  list: Array,
  children: Node | Node[],
  loading?: boolean,
  error?: boolean | Object,
  listType?: string,
};

export const UsersTable = ({ listType = 'users', ...props }: TableProps) => {
  let emptyMessage = <Text>No {listType} available</Text>;

  if (props.loading && _.isEmpty(props.list)) {
    emptyMessage = <Text>Loading...</Text>;
  }
  if (props.error) {
    emptyMessage = <Text>Failed to load {listType}. Try again later</Text>;
  }

  return (
    <DataTable
      data={props.list}
      emptyMessage={
        <Box height={200} ai="center" jc="center">
          {emptyMessage}
        </Box>
      }>
      {props.children}
    </DataTable>
  );
};

export const NameCell = ({ item, flex }) => (
  <Cell flex={flex}>
    <PersonText entry={item} />
  </Cell>
);

export const PhoneCell = ({ item, flex }) => (
  <Cell flex={flex}>
    {item.phoneNumber && Phone.parse(item.phoneNumber).formatNational()}
    {!item.phoneNumber && '-'}
  </Cell>
);
