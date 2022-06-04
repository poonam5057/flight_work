/**
 * @file
 * Both mobile and web use the same firebase interface but the underlying implementation is different
 * This is the web-compatible firebase app - it uses the `firebase` package
 */

import 'firebase/auth';
import 'firebase/analytics';
import 'firebase/firestore';
import 'firebase/functions';
import firebase from 'firebase/app';

const app = firebase.initializeApp(__FIREBASE_CONFIG__);
firebase.analytics();

app
  .firestore()
  .enablePersistence({ synchronizeTabs: true })
  .catch(console.error);

export const FirestoreFieldValue = firebase.firestore.FieldValue;

export default app;
