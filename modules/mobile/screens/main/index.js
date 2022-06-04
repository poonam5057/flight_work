/**
 * @file
 * Main screen for authenticated users
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import styled from '@emotion/native';
import { ActivityIndicator, Divider } from 'react-native-paper';

import { Stack } from '@appComponents/navigation';
import { useMyData } from '@appUtils/api';
import { Box } from '@appComponents/ScreenLayout';
import Text from '@appComponents/Text';
import Tabs, { tabScreenOptions } from './Tabs';
import Settings from './Setting';
import HeaderLeft from '../../components/HeaderLeft';

const Home = ({ navigation }) => {
  const [user, loading] = useMyData();
  if (loading) {
    return (
      <Box flex={1} ai="center" jc="center">
        <ActivityIndicator size="large" />
      </Box>
    );
  }

  if (!user.managementCompany) {
    return <WaitingRoomStack user={user} navigation={navigation} />;
  }

  return <Tabs navigation={navigation} />;
};

const WaitingRoomStack = () => (
  <Stack.Navigator initialRouteName="WaitingRoom">
    <Stack.Screen
      name="WaitingRoom"
      component={WaitingRoom}
      options={tabScreenOptions}
    />
    <Stack.Screen
      name="Settings"
      component={Settings}
      options={{
        title: '',
        headerLeft: props => <HeaderLeft title="Settings" {...props} />,
      }}
    />
  </Stack.Navigator>
);

const WaitingRoom = () => {
  const [user] = useMyData();

  return (
    <Box flex={1} ph={6} pt="50%">
      <Text size="extraExtraLarge" lh={42} weight="700" color="primary">
        Hi {user?.firstName},
      </Text>
      <ScreenDivider />
      <Text size="medium" lh={28}>
        Your account is being reviewed by the Manager. You will be notified once
        approved.
      </Text>
    </Box>
  );
};

const ScreenDivider = styled(Divider)(({ theme }) => ({
  backgroundColor: theme.colors.primary,
  marginTop: theme.layout.space(1),
  marginBottom: theme.layout.space(3),
}));

export default Home;
