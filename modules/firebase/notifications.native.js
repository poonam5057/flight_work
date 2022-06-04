/**
 * @file
 * Platform specific notifications handling (MOBILE)
 * Any exported function need to be exposed on all notifications.*.js files
 * @format
 * @flow strict-local
 */

import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

import {
  countTrips,
  getMyUserDoc,
  getUserData,
  getUserTripsQuery,
} from '@appUtils/api';
import { FieldValue, useAuthState } from './index';

export const useNotifications = navigation => {
  const [user, isLoading] = useAuthState();

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    const subscriptions = [
      setupForegroundHandler(navigation),
      setupNotificationOpenedAppHandler(navigation),
    ];

    Promise.all([
      requestUserPermission(),
      handleInitialNotification(navigation),
    ]).catch(console.error);

    return () => subscriptions.forEach(unsubscribe => unsubscribe());
  }, [isLoading, navigation, user]);
};

const setupForegroundHandler = () =>
  messaging().onMessage(async message => {
    console.log('A new FCM message arrived!', message);
    await notifee.displayNotification({
      ...message.notification,
      data: message.data,
    });
  });

const setupNotificationOpenedAppHandler = navigation =>
  messaging().onNotificationOpenedApp(message => {
    console.log(
      'Notification caused app to open from background state:',
      message.notification,
    );

    onNotificationOpened(message, navigation);
  });

const handleInitialNotification = async navigation => {
  const message = await messaging().getInitialNotification();
  if (message) {
    console.log(
      'Notification caused app to open from quit state:',
      message.notification,
    );

    onNotificationOpened(message, navigation);
  }
};

const onNotificationOpened = (message, navigation) => {
  switch (message.data?.type) {
    case 'trip-update':
      const screen = 'Trip Review';
      const documentPath = message.data.documentPath;
      navigation.navigate(screen, { documentPath });
      break;
    default:
      console.log(`No handler for message: ${JSON.stringify(message)}`);
  }
};

/**
 * Then handler here is used to process background/quit messages
 * The handler must be async and resolve once your logic has completed to free up device resources.
 * It must not attempt to update any UI (e.g. via state) - you can however perform network requests,
 * update local storage etc.
 * https://rnfirebase.io/messaging/usage#background--quit-state-messages
 */
const setupBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(async message => {
    console.log('Message handled in the background!', message);
    switch (message.data?.type) {
      case 'trip-update':
        const userData = await getUserData();
        const ref = userData.managementCompany?.ref;
        if (!ref) {
          return;
        }

        console.log('Refreshing user trips in the background');
        const snap = await getUserTripsQuery(ref, userData).get();
        const trips = snap.docs.map(d => d.data());
        const counts = countTrips(trips);

        console.log('Current user seen/unseen counts: ', counts);
        await notifee.setBadgeCount(counts.unseen);
        break;
      default:
        console.log(`No handler for BG message: ${JSON.stringify(message)}`);
    }
  });
};

/**
 * Permissions are needed for Push Notifications
 * If they are not granted messages are still received and can be displayed in-app
 * @returns {Promise<void>}
 */
const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  console.log('Notification permissions status:', authStatus);

  if (enabled) {
    const token = await messaging().getToken();
    const doc = getMyUserDoc();
    await doc.update('notificationTokens', FieldValue.arrayUnion(token));
  }

  return enabled;
};

setupBackgroundHandler();
