/**
 * @format
 * @flow strict-local
 */

import React, { Node } from 'react';
import { Button, Text } from 'react-native-paper';
import type { NavigationProp } from '@react-navigation/native';
import { ScreenLayout } from '@appComponents/ScreenLayout';

const Details = ({ navigation }: { navigation: NavigationProp }): Node => (
  <ScreenLayout>
    <Text>Details Screen</Text>
    <Button onPress={() => navigation.push('Details')}>
      Go to Details... again
    </Button>
    <Button onPress={() => navigation.navigate('Home')}>Go to Home</Button>
    <Button onPress={() => navigation.goBack()}>Go Back</Button>
    <Button onPress={() => navigation.popToTop()}>
      Go back to first screen in stack
    </Button>
  </ScreenLayout>
);

export default Details;
