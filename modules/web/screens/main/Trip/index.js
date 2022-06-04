import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import styled from '@emotion/native';

import {
  ScreenLayout,
  MainSurface,
  ScreenLoader,
} from '@appComponents/ScreenLayout';
import { useTrip } from '@appUtils/manager';

import TripDetails from './TripDetails';

const Trip = ({ route, navigation }) => {
  const documentPath = route.params.documentPath;
  const { loading, data } = useTrip(documentPath);
  const edit = useCallback(
    () => navigation.navigate('Trip Builder', { documentPath }),
    [documentPath, navigation],
  );

  return (
    <ScreenLayout alignItems="stretch">
      <ScrollView>
        <MainSurface>
          {loading ? <ScreenLoader /> : <Details data={data} onEdit={edit} />}
        </MainSurface>
      </ScrollView>
    </ScreenLayout>
  );
};

const Details: typeof TripDetails = styled(TripDetails)(({ theme }) => ({
  paddingHorizontal: '5%',
  paddingVertical: theme.layout.space(2),
}));

export default Trip;
