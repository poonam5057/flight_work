/**
 * @file
 * Web App entry point
 */

import React from 'react';
import App from '@appComponents/App';
import app from '@appFirebase';

import Screens from './screens';
import { handleMagicLink } from '../utils/auth';
import linking from './linking';

function WebApp() {
  React.useLayoutEffect(() => {
    const handler = () => confirmSignIn();

    window.addEventListener('load', handler);

    return () => window.removeEventListener('load', handler);
  }, []);

  return (
    <App linking={linking}>
      <Screens />
    </App>
  );
}

const confirmSignIn = () => {
  if (app.auth().isSignInWithEmailLink(window.location.href)) {
    return handleMagicLink(window.location.href).then(() => {
      window.history.replaceState(null, null, window.location.pathname);
    });
  }
};

export default WebApp;
