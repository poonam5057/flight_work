import React from 'react';

import Playground from '@appComponents/Playground';
import { ScreenLayout } from '@appComponents/ScreenLayout';
import { ScrollView } from 'react-native';

export default function Home({ navigation }) {
  return (
    <ScrollView>
      <ScreenLayout alignItems="flex-start">
        <Playground navigation={navigation} />
      </ScreenLayout>
    </ScrollView>
  );
}
