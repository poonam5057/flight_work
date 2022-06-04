/**
 * @file
 * Our custom DataTable
 *
 * @format
 * @flow strict-local
 */
import React, { useCallback, useMemo, useState } from 'react';
import type { Component, Node } from 'react';
import styled from '@emotion/native';
import _ from 'lodash';
import { FlatList } from 'react-native';
import { DataTable as PaperTable } from 'react-native-paper';
import Text from './Text';
import { Spacer } from '@appComponents/ScreenLayout';

type DataTableProps<RowData> = {
  data: Array<RowData>,
  children: React$Element<{ title: string, sortable?: boolean }>,
  RowComponent?: (
    React$Component<{ item: RowData, index: number, children: Node }>,
  ) => Node,
  RowSeparator?: Component,
  emptyMessage?: Node,
  footerMessage?: Node,
  keyExtractor?: (RowData, number) => Node,
  onSortChange?: ({ title: string, dir: 'asc' | 'desc' }) => void,
  initialSort?: { title: string, dir: 'asc' | 'desc' },
};

/**
 * @param props
 * @returns {JSX.Element}
 * @example
 * const data = [{ name: 'Person', aircraft: [] }, { name: 'Person 2', aircraft: [] }]
 *
 * return (
 *   <DataTable data={data}>
 *     <PlainCell title="Name" path="name" flex={5} />
 *     <AircraftCell title="Aircraft" flex={8} />
 *   </DataTable>
 * );
 *
 * /.../
 *
 * const AircraftCel = ({ item, ...cellProps }) => {
 *   const content = item.aircraft.map(a => a.tailNumber).join('\n');
 *   return <Cell {...cellProps}>{content}</Cell>
 * }
 */
export function DataTable<RowData>(props: DataTableProps<RowData>): Node {
  const cols = useMemo(
    () => React.Children.toArray(props.children).filter(Boolean),
    [props.children],
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      const RowComponent = props.RowComponent ?? Row;
      const cells = cols.map(col =>
        React.cloneElement(col, { item, index, row: item }),
      );

      return (
        <RowComponent item={item} row={item} index={index}>
          {cells}
        </RowComponent>
      );
    },
    [cols, props.RowComponent],
  );

  return (
    <Layout style={props.style}>
      <TableHeader
        onSortChange={props.onSortChange}
        defaultSort={props.initialSort}
        columns={cols.map(c => c.props)}
      />

      <FlatList
        data={props.data}
        renderItem={renderItem}
        ItemSeparatorComponent={props.RowSeparator || RowSeparator}
        keyExtractor={props.keyExtractor}
        ListEmptyComponent={props.emptyMessage}
        ListFooterComponent={props.footerMessage}
      />
    </Layout>
  );
}

const TableHeader = ({ style, columns, defaultSort, onSortChange }) => {
  const [sort, setSort] = useState(defaultSort || {});
  const getColHandler = useCallback(
    col => () =>
      setSort(current => {
        let result;

        if (current.title === col.title) {
          const dir = current.dir === 'asc' ? 'desc' : 'asc';

          result = { ...current, dir };
        } else {
          result = { title: col.title, dir: 'asc' };
        }

        onSortChange(result);
        return result;
      }),
    [onSortChange],
  );
  const sortDir = sort.dir === 'asc' ? 'ascending' : 'descending';

  return (
    <Header style={style}>
      {columns.map(col => (
        <Title
          sortDirection={
            col.sortable && sort.title === col.title ? sortDir : undefined
          }
          onPress={
            col.sortable && onSortChange ? getColHandler(col) : undefined
          }
          flex={col.flex}
          numeric={col.numeric}
          key={col.name || col.title}>
          <Text>{col.title?.toUpperCase()}</Text>
        </Title>
      ))}
    </Header>
  );
};

export const Row = styled(PaperTable.Row)(({ theme }) => ({
  paddingVertical: theme.layout.space(0.5),
  backgroundColor: theme.colors.background,
  borderBottomWidth: 0,
  borderBottomColor: 'transparent',
  borderRadius: theme.roundness,
  paddingHorizontal: theme.layout.space(1),
  cursor: 'text',
}));

export const Cell = styled(PaperTable.Cell)(({ theme, flex = 1 }) => ({
  flex,
  paddingHorizontal: 0,
  cursor: false,
}));

export const PlainCell = React.memo(
  ({ row, path, suffix, ...cellProps }) => {
    const value = _.get(row, path, '-');
    const units = value === '-' ? '' : suffix;
    return (
      <Cell {...cellProps}>
        {value}
        {units}
      </Cell>
    );
  },
  (a, b) => a.path === b.path && _.isEqualWith(a.row, b.row, b.path),
);

const Layout = styled(PaperTable)(({ theme }) => ({
  paddingHorizontal: theme.layout.space(0.5),
}));

const Header = styled(PaperTable.Header)(() => ({
  borderBottomWidth: 0,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
}));

const Title = styled(PaperTable.Title)(({ theme, flex = 1 }) => ({
  flex,
  paddingBlock: 0,
  backgroundColor: theme.colors.tableBackground,
  cursor: 'pointer',
}));

const RowSeparator = () => <Spacer size={0.25} />;

export default DataTable;
