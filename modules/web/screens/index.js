import React, { useState, useEffect } from 'react';

import { Stack } from '@appComponents/navigation';
import { useAuthState } from '@appFirebase';
import Main from './main';
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import { useMyData } from '@appUtils/api';
import { UserRole } from '@appUtils/tripConverter';
import Text from '@appComponents/Text';
import Dialog from '@appComponents/Dialog';
import Button from '@appComponents/Button';
import Terms from './common/Terms';
import PrivacyPolicy from './common/PrivacyPolicy';

export default function Screens() {
  const [auth, isLoading] = useAuthState();

  if (isLoading) {
    return null;
  }

  const AppScreens = auth ? AuthenticatedScreens : UnauthenticatedScreens;

  return (
    <AppScreens>
      <Stack.Group>
        <Stack.Screen
          name="Terms"
          component={Terms}
          options={{ title: 'Terms and Conditions' }}
        />
        <Stack.Screen
          name="Privacy"
          component={PrivacyPolicy}
          options={{ title: 'Privacy Policy' }}
        />
      </Stack.Group>
    </AppScreens>
  );
}

const AuthenticatedScreens = ({ children }) => {
  const [user, userLoading] = useMyData();
  if (userLoading) {
    return <UnauthenticatedScreens children={children} />;
  }

  const hasWebAccess =
    !userLoading &&
    (user.role === UserRole.MANAGER || user.role === UserRole.EMPLOYEE);

  if (!hasWebAccess) {
    return <UnauthenticatedScreens showWarning={true} children={children} />;
  }

  return (
    <Stack.Navigator>
      <Stack.Group>
        {/*The Main screen is a Drawer Navigator that handles all our main app routes*/}
        <Stack.Screen
          name="Main"
          component={Main}
          options={{ headerShown: false }}
        />
        {/*Non-drawer screen like modals can be added here*/}
      </Stack.Group>
      {children}
    </Stack.Navigator>
  );
};

const UnauthenticatedScreens = ({ showWarning = false, children }) => {
  const [dialogVisible, setDialogVisible] = useState(showWarning);

  useEffect(() => {
    setDialogVisible(showWarning);
  }, [showWarning]);

  return (
    <>
      <WebAccessDialog
        dialogVisible={dialogVisible}
        setDialogVisible={setDialogVisible}
      />
      <Stack.Navigator>
        <Stack.Group screenOptions={{ headerShown: false }}>
          {/*Typically, for landing pages and register/login screens*/}
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Forgot Password" component={ForgotPassword} />
        </Stack.Group>
        {children}
      </Stack.Navigator>
    </>
  );
};

const WebAccessDialog = ({ dialogVisible, setDialogVisible }) => {
  return (
    <Dialog
      title="This user does not have access to the Web app."
      visible={dialogVisible}
      actionSlot={[
        <Button
          key="close"
          mode="outlined"
          color="dark"
          onPress={() => setDialogVisible(false)}>
          Close
        </Button>,
      ]}>
      <Text>
        Please login to the Mobile app or login with a different user.
      </Text>
    </Dialog>
  );
};
