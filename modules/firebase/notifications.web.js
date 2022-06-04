/**
 * @file
 * Platform specific notifications handling (WEB)
 * Any exported function need to be exposed on all notifications.*.js files
 * @format
 * @flow strict-local
 */
import { useEffect } from 'react';

export const useNotifications = navigation => {
  useEffect(() => {
    console.debug('Notifications on web are not implemented yet');
  }, []);
};
