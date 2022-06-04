import React from 'react';
import { ScreenLayout } from '@appComponents/ScreenLayout';
import MobileView from '../../components/MobileView';
import Button from '@appComponents/Button';
import { useTheme } from '@appComponents/theme';

const Owners = (): Node => {
  const theme = useTheme();

  return (
    <MobileView>
      <ScreenLayout color={theme.colors.background}>
        <Button>+ Add New Owner</Button>
      </ScreenLayout>
    </MobileView>
  );
};

export default Owners;
