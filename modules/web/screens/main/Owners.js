import React from 'react';

import { MainSurface, ScreenLayout } from '@appComponents/ScreenLayout';

import UserList from '../../../web/components/UserList';

const Owners = () => (
  <ScreenLayout alignItems="stretch">
    <MainSurface>
      <UserList />
    </MainSurface>
  </ScreenLayout>
);

export default Owners;
