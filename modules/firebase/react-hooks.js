/**
 * @file
 * Firebase helper hooks
 *
 * @format
 * @flow strict-local
 */

import { useAuthState as authStateHook } from 'react-firebase-hooks/auth';
export {
  useCollection,
  useDocument,
  useDocumentData,
  useDocumentDataOnce,
} from 'react-firebase-hooks/firestore';

import app from './app';

/**
 * @returns {[(firebase.User | null | undefined), boolean, (firebase.auth.Error | undefined)]}
 * Array like: [user, loading, error]
 */
export const useAuthState = () => authStateHook(app.auth());
