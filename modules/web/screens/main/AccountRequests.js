/**
 * @file
 * List of users (pilots or owners) requesting access to the management company
 *
 * @format
 * @flow strict-local
 */

import React from 'react';

import {
  MainSurface,
  ScreenLayout,
  ScreenLoader,
} from '@appComponents/ScreenLayout';
import { UserRole } from '@appUtils/tripConverter';
import {
  Cell,
  NameCell,
  PhoneCell,
  PlainCell,
  UsersTable,
} from '../../components/TableCells';
import { Menu } from 'react-native-paper';
import Button from '@appComponents/Button';
import { useMenuState } from '@appComponents/Menu';
import { useAsyncCallback } from 'react-async-hook';
import {
  AccountState,
  useAccountRequestHandler,
  useAccountRequests,
} from '@appUtils/manager';

const AccountRequests = () => (
  <ScreenLayout alignItems="stretch">
    <MainSurface>
      <UserList />
    </MainSurface>
  </ScreenLayout>
);

const UserList = () => {
  const { data: requests, loading } = useAccountRequests();

  if (loading) {
    return <ScreenLoader />;
  }

  return (
    <UsersTable list={requests} loading={loading} listType="account requests">
      <NameCell title="Name" flex={6} />
      <PlainCell title="Email" path="email" flex={6} />
      <PhoneCell title="Phone" flex={4} />
      <RoleCell title="Role" flex={2} />
      <PlainCell title="Status" path="state" flex={2} />
      <ActionsCell name="actions" numeric flex={1} icon="more-dots" />
    </UsersTable>
  );
};

const RoleCell = ({ item: user, ...cellProps }) =>
  Boolean(user) && (
    <Cell {...cellProps}>
      {user.role[0].toUpperCase()}
      {user.role.slice(1)}
    </Cell>
  );

const ActionsCell = ({ item: user, ...cellProps }) => {
  const { open, isOpen, close } = useMenuState();
  const handleRequest = useAccountRequestHandler(user);
  const action = useAsyncCallback((state, role) => {
    close();
    return handleRequest(state, role);
  });

  const anchor = (
    <Button
      mode="text"
      icon="more-dots"
      loading={action.loading}
      onPress={open}
    />
  );

  return (
    <Cell {...cellProps}>
      <Menu anchor={anchor} visible={isOpen} onDismiss={close}>
        <Menu.Item
          title="Accept"
          onPress={() => action.execute(AccountState.ACCEPTED)}
        />
        {user.role !== UserRole.OWNER && (
          <Menu.Item
            title="Accept as Owner"
            onPress={() =>
              action.execute(AccountState.ACCEPTED, UserRole.OWNER)
            }
          />
        )}
        {user.role !== UserRole.PILOT && (
          <Menu.Item
            title="Accept as Pilot"
            onPress={() =>
              action.execute(AccountState.ACCEPTED, UserRole.PILOT)
            }
          />
        )}
        {user.state !== AccountState.REJECTED && (
          <Menu.Item
            title="Reject"
            onPress={() => action.execute(AccountState.REJECTED)}
          />
        )}
      </Menu>
    </Cell>
  );
};

export default AccountRequests;
