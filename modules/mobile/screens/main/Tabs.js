import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Stack } from '@appComponents/navigation';
import Button from '@appComponents/Button';
import { useMyData } from '@appUtils/api';
import { useNotifications } from '@appFirebase';
import { UserRole } from '@appUtils/tripConverter';
import { Icon, useTheme } from '@appComponents/theme';
import NativeAppLogo from '../../../../assets/logo/native-app-logo.svg';
import HeaderLeft from '../../components/HeaderLeft';
import PassengerStack from './passengers';
import TripStack from './trips';
import SettingStack from './Setting';
import AircraftStack from './aircraft';

const Tab = createMaterialBottomTabNavigator();
export const tabScreenOptions = ({ navigation }) => ({
  title: '',
  headerLeft: () => <NativeAppLogo width={83} height={26} />,
  headerRight: () => (
    <Button
      onPress={() => navigation.navigate('Settings')}
      mode="text"
      icon="cog"
    />
  ),
});

const Trips = () => (
  <TripStack mainOptions={tabScreenOptions}>{SettingsScreen}</TripStack>
);

const Passengers = () => (
  <PassengerStack mainOptions={tabScreenOptions}>
    {SettingsScreen}
  </PassengerStack>
);

const SettingsScreen = (
  <Stack.Screen
    name="Settings"
    component={SettingStack}
    options={{
      headerShown:false,
      headerBackTitle: '',
      title: '',
      headerLeft: props => <HeaderLeft title="Settings" {...props} />,
    }}
  />
);

const Aircraft = () => {
  return (
    <AircraftStack mainOptions={tabScreenOptions} children={SettingsScreen} />
  );
};

export default function Tabs({ navigation }) {
  const theme = useTheme();
  const [user] = useMyData();
  useNotifications(navigation);

  return (
    <Tab.Navigator
      initialRouteName="TripStack"
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.inactive}
      shifting={false}
      barStyle={{ backgroundColor: theme.colors.header }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName;

          switch (route.name) {
            case 'Trips':
              iconName = 'home';
              break;
            case 'PassengerStack':
              iconName = 'passengers';
              break;
            case 'AircraftStack':
              iconName = 'mobile-aircraft';
              break;
          }
          return <Icon name={iconName} size={18} fill={color} />;
        },
      })}>
      <Tab.Screen
        name="Trips"
        component={Trips}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      {user?.role === UserRole.OWNER && (
        <Tab.Screen
          name="PassengerStack"
          component={Passengers}
          options={{
            tabBarLabel: 'Passengers',
          }}
        />
      )}
      <Tab.Screen
        name="AircraftStack"
        component={Aircraft}
        options={{
          tabBarLabel: 'Aircraft',
        }}
      />
    </Tab.Navigator>
  );
}
