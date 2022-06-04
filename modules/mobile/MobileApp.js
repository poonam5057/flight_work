/**
 * Mobile App Entry point
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect } from 'react';
import type { Node } from 'react';
import { StatusBar } from 'react-native';

import app from '@appFirebase';
import App from '../components/App';
import Screens from './screens';
import { handleMagicLink } from '../utils/auth';

const MobileApp: () => Node = () => {
  useDynamicLinks();

  return (
    <App>
      <Main />
    </App>
  );
};

const Main = (): Node => {
  return (
    <>
      <StatusBar animated barStyle="light-content" />
      <Screens />
    </>
  );
};

const useDynamicLinks = () =>
  useEffect(() => {
    app.dynamicLinks().onLink(handleDynamicLink);
    app.dynamicLinks().getInitialLink().then(handleDynamicLink);
  }, []);

const handleDynamicLink = link => {
  if (!link) {
    return;
  }

  console.debug('on dynamic link: ', link);

  if (app.auth().isSignInWithEmailLink(link.url)) {
    return handleMagicLink(link.url);
  }

  return Promise.resolve();
};

export default MobileApp;
