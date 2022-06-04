/**
 * @file
 * Owner status component
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import styled from '@emotion/native';

import { OwnerState, OwnerStateValue } from '@appUtils/tripConverter';
import Status from './StatusChip';

type StatusProps = {
  state?: OwnerStateValue,
};

const OwnerStatus = ({ state }: StatusProps) => (
  <StatusChip
    status={state || OwnerState.MANAGER_DRAFT}
    mapStatusToColor={mapStatusToColor}
  />
);

const mapStatusToColor = theme => ({
  [OwnerState.MANAGER_UPDATED]: theme.colors.updated,
  [OwnerState.MANAGER_CANCELED]: theme.colors.error,
  [OwnerState.OWNER_REJECTED]: theme.colors.error,
  [OwnerState.OWNER_ACCEPTED]: theme.colors.accepted,
});

const StatusChip: typeof Status = styled(Status)(({ theme }) => ({
  marginLeft: theme.layout.space(1),
}));

export default OwnerStatus;
