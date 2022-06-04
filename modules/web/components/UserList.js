import React from 'react';
import _ from 'lodash';

import { ScreenLoader } from '@appComponents/ScreenLayout';
import { useCompanyUsers } from '@appUtils/api';
import { useUserAircraft } from '@appUtils/aircraft';
import { UserRole } from '@appUtils/tripConverter';
import { Cell, NameCell, PhoneCell, PlainCell, UsersTable } from './TableCells';

const UserList = ({ role = UserRole.OWNER }) => {
  const [list, loading] = useCompanyUsers(role);

  if (loading) {
    return <ScreenLoader />;
  }

  return (
    <UsersTable list={list} loading={loading} listType={role}>
      <NameCell title="Name" flex={40} />
      <PlainCell title="Email" path="email" flex={30} />
      <PhoneCell title="Phone" flex={15} />
      <AircraftCell title="Aircraft" role={role} flex={15} />
    </UsersTable>
  );
};

const AircraftCell = ({ item: user = {}, role = '', flex }) => {
  const { data = [] } = useUserAircraft({ id: user?.id, role });

  return (
    <Cell flex={flex}>
      {_.isEmpty(data) && '-'}
      {_.map(data, craft => craft.tailNumber).join('\n')}
    </Cell>
  );
};

export default UserList;
