/**
 * @file
 * Functions used for authentication.
 * 1. Login
 * 2. Log Out
 * 3. Signing in using an email and sign-in email link
 *
 * @format
 * @flow strict-local
 */

import app from '@appFirebase';
import { parsePhoneNumberFromString } from 'libphonenumber-js/mobile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmailAuthProvider } from '../firebase';
import { getMyUserDoc } from './api';

const createUser = app.functions().httpsCallable('createUser');

export const login = async ({ email, password }) =>
  app
    .auth()
    .signInWithEmailAndPassword(email, password)
    .catch(defaultCatchHandler);

export const createAccount = async ({ phone, ...payload }) => {
  const phoneNumber = parsePhoneNumberFromString(phone, 'US').number;
  const { data } = await createUser({ ...payload, phoneNumber });

  if (data.error) {
    throw data.error;
  }

  const credential = await login(payload);
  await credential.user.sendEmailVerification();
};

export const updateUser = async ({ firstName, lastName, phone }) => {
  const { currentUser } = app.auth();
  const userRef = getMyUserDoc();

  const phoneNumber = parsePhoneNumberFromString(phone, 'US').number;

  await currentUser.updateProfile({
    displayName: firstName,
    phoneNumber,
  });

  await userRef.update({ firstName, lastName, phoneNumber });
};

export const updateAccount = async ({ email, currentPassword, password }) => {
  const { currentUser } = app.auth();

  const authCredential = EmailAuthProvider.credential(
    currentUser.email,
    currentPassword,
  );

  await currentUser.reauthenticateWithCredential(authCredential);
  await currentUser.updateEmail(email);

  if (password?.length) {
    await currentUser.updatePassword(password);
  }
};

export const updateChangePassword = async ({ CurrentPassword, NewPassword }) => {
  const { currentUser } = app.auth();

  const authCredential = EmailAuthProvider.credential(
    currentUser.email,
    CurrentPassword,
    NewPassword
  );
  await currentUser.reauthenticateWithCredential(authCredential);

  if (NewPassword?.length) {
    await currentUser.updatePassword(NewPassword);
  }
};

export const logOut = () => app.auth().signOut().catch(defaultCatchHandler);

export const handleMagicLink = async link => {
  try {
    const email = await AsyncStorage.getItem('emailForSignIn');
    await app.auth().signInWithEmailLink(email, link);
  } catch (error) {
    defaultCatchHandler(error);
  }
};

export const sendSignInLink = async ({
  email,
  actionCodeSettings = DEFAULT_ACTION_CODE_SETTINGS,
}) => {
  try {
    const loginMethods = await app.auth().fetchSignInMethodsForEmail(email);
    const invalid = loginMethods.length === 0;

    if (invalid) {
      return;
    }

    await AsyncStorage.setItem('emailForSignIn', email);
    await app.auth().sendSignInLinkToEmail(email, actionCodeSettings);
  } catch (error) {
    defaultCatchHandler(error);
  }
};

const defaultCatchHandler = error => {
  if (__DEV__) {
    console.error(error);
  }
  throw error;
};

const DEFAULT_ACTION_CODE_SETTINGS = {
  handleCodeInApp: true,
  url: window.location?.origin ?? 'https://flightapp-prod.web.app',
  iOS: {
    bundleId: 'io.ensembleapps.flightapp',
  },
  android: {
    packageName: 'com.flightworks',
    installApp: true,
    minimumVersion: '12',
  },
};
