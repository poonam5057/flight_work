/**
 * @file
 * A component for editing or selecting a person (like a pilot or a passenger)
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback, useMemo, useState, Ref, useEffect } from 'react';
import { ViewStyle, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import Text from '@appComponents/Text';
import Button from '@appComponents/Button';
import SearchField, { ActionMeta } from '@appComponents/SearchField';
import _ from 'lodash';

type PersonProps = {
  person: PersonItem,
  onChange: (PersonItem, ActionMeta<PersonItem>) => void,
  people: PersonItem[],
  style?: ViewStyle,
  onMenuOpen?: () => {},
  onMenuClose?: () => {},
  renderName?: PersonItem => Node | string,
  loading?: boolean,
  autoFocus?: boolean,
  unavailablePeople?: PersonItem[],
  controllerRef?: Ref<{ toggleEdit(): void, setEditMode(boolean): void }>,
  canCreateNewEntries?: boolean,
};

export type PersonItem = {
  name: string,
};

const PersonEdit = ({
  person,
  onChange,
  people,
  style,
  onMenuOpen,
  onMenuClose,
  renderName = item =>
    item.name ||
    [item.firstName, item.lastName].filter(Boolean).join(' ').trim(),
  loading = false,
  autoFocus = true,
  unavailablePeople = [],
  controllerRef,
  canCreateNewEntries = true,
}: PersonProps) => {
  const [editMode, setEditMode] = useState(autoFocus && !renderName(person));
  const toggleEdit = useCallback(() => setEditMode(prev => !prev), []);

  const isValidNewOption = useValidNewOptionCheck(canCreateNewEntries, people);
  const isOptionDisabled = useDisabledOptionCheck(
    unavailablePeople,
    renderName,
  );

  const remapped = useSortedOptions(people, isOptionDisabled);

  const styles = useStyles();

  useControllerHandle(controllerRef, { toggleEdit, setEditMode });

  return (
    <View style={[styles.layout, style]}>
      {editMode ? (
        <SearchField
          placeholder="Name"
          autoFocus={autoFocus}
          defaultValue={person.name && person}
          options={remapped}
          loading={loading}
          getOptionLabel={option => option?.label || renderName(option)}
          getOptionValue={renderName}
          onChange={onChange}
          onBlur={canCreateNewEntries ? undefined : toggleEdit}
          onMenuOpen={onMenuOpen}
          onMenuClose={onMenuClose}
          isOptionDisabled={isOptionDisabled}
          isValidNewOption={isValidNewOption}
          style={[styles.field, styles.gap]}
        />
      ) : (
        <View style={[styles.gap, styles.field]}>
          <Text color="dark" size="medium" weight={400} font="light">
            {renderName(person)}
          </Text>
        </View>
      )}
      {!editMode && (
        <Button mode="outlined" color="dark" icon="edit" onPress={toggleEdit} />
      )}
    </View>
  );
};

const useValidNewOptionCheck = (canCreate, people) => {
  const peopleFlat = useMemo(
    () => canCreate && people.flatMap(p => p.options || p),
    [canCreate, people],
  );

  return useCallback(
    input => {
      return (
        canCreate &&
        input.length >= 3 &&
        peopleFlat.every(p => p.name !== input)
      );
    },
    [canCreate, peopleFlat],
  );
};

const useDisabledOptionCheck = (unavailable, getValue) =>
  useCallback(
    option => unavailable.some(u => getValue(u) === getValue(option)),
    [getValue, unavailable],
  );

const useSortedOptions = (options = [], isOptionDisabled) =>
  useMemo(() => {
    const mapAndSort = items =>
      _.chain(items)
        .map(item => {
          if (_.size(item.options) > 0) {
            const copy = _.clone(item);
            copy.options = mapAndSort(item.options);
            return copy;
          }

          return item;
        })
        .sortBy(isOptionDisabled)
        .value();

    return mapAndSort(options);
  }, [isOptionDisabled, options]);

const useControllerHandle = (controllerRef, state) =>
  useEffect(() => {
    if (!controllerRef) {
      return;
    }

    if (typeof controllerRef === 'function') {
      controllerRef(state);
    } else {
      controllerRef.current = state;
    }
  }, [controllerRef, state]);

const useStyles = () => {
  const theme = useTheme();
  return useMemo(
    () => ({
      layout: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 52,
        maxWidth: 224,
      },
      field: {
        flex: 1,
        backgroundColor: theme.colors.surface,
      },
      gap: {
        marginRight: theme.layout.gap(2),
      },
    }),
    [theme.colors.surface, theme.layout],
  );
};

export default PersonEdit;
