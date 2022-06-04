/**
 * @file
 * Owner dropdown/search component
 *
 * @format
 * @flow strict-local
 */

import React, { Ref } from 'react';
import { ViewStyle } from 'react-native';

import SearchField from '@appComponents/SearchField';
import { useCompanyUsers } from '@appUtils/api';
import { UserRole } from '@appUtils/tripConverter';

type SelectOwnerProps = {
  owner?: OwnerItem,
  onChange?: OwnerItem => void,
  onBlur?: Event => void,
  style?: ViewStyle,
  controlStyle?: ViewStyle,
  autoFocus?: boolean,
  innerRef?: Ref,
  isClearable?: boolean,
  isOptionDisabled?: OwnerItem => boolean,
  disabled?: boolean,
};

export type OwnerItem = {
  id: string,
  firstName: string,
  lastName: string,
};

const SelectOwner = ({
  owner,
  onChange,
  onBlur,
  style,
  controlStyle,
  autoFocus,
  innerRef,
  isClearable,
  isOptionDisabled,
  disabled,
}: SelectOwnerProps) => {
  const [options, loading] = useCompanyUsers(UserRole.OWNER);

  return (
    <SearchField
      innerRef={innerRef}
      isClearable={isClearable}
      placeholder="Select an Owner"
      autoFocus={autoFocus}
      defaultValue={owner}
      options={options}
      loading={loading}
      getOptionLabel={o => `${o.firstName} ${o.lastName}`}
      getOptionValue={o => o.id}
      isValidNewOption={() => false}
      isOptionDisabled={isOptionDisabled}
      onChange={onChange}
      onBlur={onBlur}
      style={style}
      controlStyle={controlStyle}
      disabled={disabled}
    />
  );
};

export default SelectOwner;
