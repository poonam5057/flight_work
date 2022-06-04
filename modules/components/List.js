/**
 * @file
 * An abstract list component that supports adding and removing entries and delegates
 * item rendering to the parent component
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback, useState } from 'react';
import styled from '@emotion/native';
import { HelperText } from 'react-native-paper';
import { FlatList } from 'react-native';
import color from 'color';
import type { ViewStyle, FlexStyle } from 'react-native';

import { Spacer } from './ScreenLayout';
import Button from './Button';

type ListProps<ItemT> = {
  items: ItemT[],
  renderItem: ({ item: ItemT, index: number }) => Node,
  onAdd?: () => void,
  onRemove?: ({ item: ItemT, index: number }) => void,
  addButtonLabel?: string,
  disableAdd?: boolean,
  canRemove?: ({ item: ItemT, index: number }) => boolean,
  canAdd?: boolean,
  style?: ViewStyle,
  maxItems?: number,
  maxItemsMessage?: string,
  numColumns?: number,
  ListHeaderComponent?: Node | React$Component,
  rowJustify?: FlexStyle['justifyContent'],
  rowAlign?: FlexStyle['alignItems'],
  keyExtractor?: (item: ItemT, index: number) => string,
  RemoveButtonComponent?: typeof Button,
  ItemSeparatorComponent?: typeof Spacer,
};

const List = ({
  items,
  renderItem,
  onAdd,
  onRemove,
  disableAdd,
  addButtonLabel = 'Add',
  canRemove = () => Boolean(onRemove),
  canAdd = Boolean(onAdd),
  style,
  maxItems,
  maxItemsMessage = 'Maximum amount of entries reached',
  numColumns,
  ListHeaderComponent,
  rowJustify,
  rowAlign,
  keyExtractor,
  RemoveButtonComponent = RemoveButton,
  ItemSeparatorComponent = ItemSeparator,
}: ListProps) => {
  const itemRenderer = useCallback(
    itemProps => (
      <Row numColumns={numColumns} rowJustify={rowJustify} rowAlign={rowAlign}>
        {renderItem(itemProps)}
        {canRemove(itemProps) && RemoveButtonComponent && (
          <RemoveButtonComponent onPress={() => onRemove(itemProps)} />
        )}
        {numColumns > 1 && <Spacer size={1} dir="horizontal" />}
      </Row>
    ),
    [
      RemoveButtonComponent,
      canRemove,
      numColumns,
      onRemove,
      renderItem,
      rowAlign,
      rowJustify,
    ],
  );

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={itemRenderer}
      style={style}
      numColumns={numColumns}
      ItemSeparatorComponent={ItemSeparatorComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        <Footer>
          {canAdd && (
            <AddButton
              onPress={onAdd}
              disabled={disableAdd || items.length >= maxItems}>
              {addButtonLabel}
            </AddButton>
          )}
          {items.length >= maxItems && (
            <HelperText>{maxItemsMessage}</HelperText>
          )}
        </Footer>
      }
    />
  );
};

/**
 * Common logic related to adding/removing pending entries to a list
 * @param items
 * @param onRemove
 * @returns {ListController}
 */
export const useGenericListControl = ({ items, onRemove }): ListController => {
  const [hasPendingAdd, setHasPendingAdd] = useState(false);
  const addEntry = useCallback(() => setHasPendingAdd(true), []);
  const removePending = useCallback(() => setHasPendingAdd(false), []);

  const removeEntry = useCallback(
    ({ item }) => {
      if (item.isPendingAdd) {
        setHasPendingAdd(false);
      } else {
        onRemove(item);
      }
    },
    [onRemove],
  );

  return {
    hasPendingAdd,
    addEntry,
    removeEntry,
    removePending,
    items: hasPendingAdd ? [...items, { isPendingAdd: true }] : items,
  };
};

type ListController<T> = {
  hasPendingAdd: boolean,
  addEntry(): void,
  removeEntry({ item: T }): void,
  removePending(): void,
  items: Array<T>,
};

export const Row: View = styled.View`
  flex-direction: row;
  align-items: ${({ rowAlign = 'center' }) => rowAlign};
  justify-content: ${({ rowJustify = 'flex-start' }) => rowJustify};
  min-width: ${({ numColumns }) => `${99 / numColumns}%`};
`;

export const ItemSeparator = ({ size }) => <Spacer size={size} />;

export const Footer: View = styled(Row)`
  margin-top: ${({ theme }) => theme.layout.space(0.5).toString()}px;
`;

export const AddButton = styled<typeof Button>(Button)`
  width: fit-content;
`;

AddButton.defaultProps = {
  color: 'accent',
  icon: 'add',
};

export const RemoveButton = styled<typeof Button>(Button)(
  ({ theme, size }) => ({
    marginLeft: theme.layout.gap(2),
    borderColor: color(theme.colors.error).lighten(0.3).hex(),
    backgroundColor: color(theme.colors.error).lighten(0.9).hex(),
    alignItems: 'center',
    width: size,
    height: size,
  }),
);

RemoveButton.defaultProps = {
  mode: 'outlined',
  icon: 'bin',
  color: 'error',
  accessibilityLabel: 'remove entry',
};

export default List;
