import React from 'react';

import { MainSurface, ScreenLayout } from '@appComponents/ScreenLayout';
import { UserRole } from '@appUtils/tripConverter';

import UserList from '../../../web/components/UserList';

const Pilots = () => (
  <ScreenLayout alignItems="stretch">
    <MainSurface>
      <UserList role={UserRole.PILOT} />
    </MainSurface>
  </ScreenLayout>
);

export default Pilots;
