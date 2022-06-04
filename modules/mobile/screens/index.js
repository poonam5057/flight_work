import React from 'react';

import { Stack } from '@appComponents/navigation';
import { useAuthState } from '@appFirebase';
import Main from './main';
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import CreateAccount from './auth/CreateAccount';
import NativeAppLogo from '../../../assets/logo/native-app-logo.svg';
import { subScreenOptions } from '../components/HeaderLeft';
import Terms from './common/Terms';

export default function Screens() {
  const [user, isLoading] = useAuthState();
  if (isLoading) {
    return null;
  }

  const isAuthenticated = Boolean(user);

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <Stack.Group>
          {/* The main screen is a BottomTabNavigator that handles the main mobile tabs */}
          <Stack.Screen
            name="Main"
            component={Main}
            options={{
              headerShown: false,
            }}
          />
          {/* Screens that should not have the bottom navigation tabs can be added here */}
        </Stack.Group>
      ) : (
        <Stack.Group>
          {/* Typically, for landing pages and register/login screens */}
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              title: '',
              headerLeft: () => <NativeAppLogo width={83} height={26} />,
            }}
          />
          <Stack.Screen name="Forgot Password" component={ForgotPassword} />
          <Stack.Screen name="Create Account" component={CreateAccount} />
        </Stack.Group>
      )}

      <Stack.Group>
        {/*Any screens that should be available to both authenticated and non-authenticated users*/}
        <Stack.Screen
          name="Terms And Conditions"
          component={Terms}
          options={subScreenOptions}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
