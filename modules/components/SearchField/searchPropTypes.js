import type { ViewStyle } from 'react-native';
import type { ActionMeta as SelectActionMeta } from 'react-select';
import type { Ref } from 'react';

export type SearchFieldProps<Option> = {
  defaultValue?: Option,
  /**
   * These are displayed before the user starts typing
   * Default options are only showed if we're using `loadOptions`
   * Otherwise just include the defaults on top of the regular options
   */
  defaultOptions?: Option[] | Group<Option>[],
  /**
   * Provide the `options` prop when all the options would be fetched at once
   * Then they'll filtered locally by the component
   * Otherwise use `loadOptions`
   */
  options?: Option[] | Group<Option>[],
  getOptionLabel?: Option => string,
  getOptionValue?: Option => string,
  isClearable?: boolean,
  /**
   * Use this when you need to apply custom logic
   * Otherwise set `option.isDisable` to `true` for any option that should be disabled
   */
  isOptionDisabled?: Option => boolean,
  /**
   * If this prop is provided the "Add ..." option would appear only when
   * the function returns true
   * @param input
   * @param selectedOption
   * @param allOptions
   */
  isValidNewOption?: (string, Option, Option[] | Group<Option>[]) => boolean,
  onChange: (Option, SelectActionMeta<Option>) => void,
  onBlur?: Event => void,
  onMenuOpen?: () => void,
  onMenuClose?: () => void,
  /**
   * Use the input to retrieve options asynchronously the result would be
   * presented in the dropdown menu options
   * a loading indicator is presented until the promise is resolved
   */
  loadOptions?: string => Promise<Option[] | Group<Option>[]>,
  autoFocus?: boolean,
  placeholder?: string,
  name?: string,
  /**
   * Our last option in the list would be a button to create a new entry
   * Use this function to provide the button content
   */
  formatCreateLabel?: string => string | Node | null,
  formatGroupLabel?: (Group<Option>) => string | Node | null,
  /**
   * When the search term doesn't match anything we'll show this message
   */
  noOptionsMessage?: string => string | Node | null,
  style?: ViewStyle,
  controlStyle?: ViewStyle,
  disabled?: boolean,
  loading?: boolean,
  innerRef?: Ref,
};

type Group<Option> = { label: string, options: Option[] };

export type ActionMeta = SelectActionMeta;

export const defaultSearchProps = {
  formatCreateLabel: input => `Add "${input}"`,
  noOptionsMessage: input =>
    input.length > 0 ? `No matches for "${input}"` : 'Search for something',
};
