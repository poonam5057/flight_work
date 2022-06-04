/**
 * @file
 * Search Field (Select) component used on Web
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback, useMemo } from 'react';
import { lazy, Suspense } from 'react';
import type { StatelessFunctionalComponent } from 'react';
import merge from 'deepmerge';

import { useTheme } from '@appComponents/theme';
import { defaultSearchProps, SearchFieldProps } from './searchPropTypes';

/**
 * The main difference between these is the Sync version receives all the options and
 * applies filtration internally while the Async version calls `loadOptions` and expects
 * to receive the filtered options
 */
const AsyncSelect = lazy(() => import('react-select/async-creatable'));
const SyncSelect = lazy(() => import('react-select/creatable'));

const SearchField: StatelessFunctionalComponent<SearchFieldProps> = ({
  defaultValue,
  defaultOptions,
  options,
  autoFocus,
  isClearable,
  isOptionDisabled,
  isValidNewOption,
  placeholder,
  name,
  loadOptions,
  getOptionLabel,
  getOptionValue,
  formatCreateLabel,
  formatGroupLabel,
  noOptionsMessage,
  onChange,
  onBlur,
  onMenuOpen,
  onMenuClose,
  disabled,
  loading,
  style,
  controlStyle,
  innerRef,
}) => {
  const Select = loadOptions ? AsyncSelect : SyncSelect;

  return (
    <Suspense fallback={null}>
      <Select
        isSearchable
        openMenuOnFocus
        isClearable={isClearable}
        isDisabled={disabled}
        isLoading={loading}
        isOptionDisabled={isOptionDisabled}
        isValidNewOption={isValidNewOption}
        defaultValue={defaultValue}
        defaultOptions={defaultOptions}
        options={options}
        menuPortalTarget={document.body}
        placeholder={placeholder}
        name={name}
        loadOptions={loadOptions}
        getOptionLabel={getOptionLabel}
        getOptionValue={getOptionValue}
        formatCreateLabel={formatCreateLabel}
        formatGroupLabel={formatGroupLabel}
        noOptionsMessage={noOptionsMessage}
        onChange={onChange}
        onBlur={onBlur}
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
        autoFocus={autoFocus}
        theme={useCustomTheme()}
        styles={useCustomStyles({ style, controlStyle })}
        minMenuHeight={200}
        menuPlacement="auto"
        ref={innerRef}
      />
    </Suspense>
  );
};

const useCustomTheme = () => {
  const theme = useTheme();
  return useCallback(defaultTheme => merge(defaultTheme, theme), [theme]);
};

const useCustomStyles = ({ style, controlStyle }) => {
  const theme = useTheme();

  return useMemo(
    () => ({
      container: (base, state) => ({
        ...base,
        ...merge.all(Array.isArray(style) ? style : [style || {}]),
        ...theme.fonts.regular,
      }),
      control: base => ({
        ...base,
        ...controlStyle,
      }),
      menu: base => ({
        ...base,
        ...theme.fonts.regular,
      }),
    }),
    [controlStyle, style, theme.fonts.regular],
  );
};

SearchField.defaultProps = defaultSearchProps;

export type { ActionMeta } from './searchPropTypes';

export default SearchField;
