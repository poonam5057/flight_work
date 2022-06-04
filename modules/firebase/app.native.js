/**
 * @file
 * Both mobile and web use the same firebase interface but the underlying implementation is different
 * This is the mobile-compatible firebase app - it uses the `@react-native-firebase/*` packages
 */

import '@react-native-firebase/auth';
import '@react-native-firebase/analytics';
import Firestore from '@react-native-firebase/firestore';
import '@react-native-firebase/functions';
import '@react-native-firebase/dynamic-links';

import app from '@react-native-firebase/app';

export const FirestoreFieldValue = Firestore.FieldValue;

export default app;
