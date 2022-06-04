/**
 * @file
 * Our custom Notification
 *
 * @format
 * @flow strict-local
 */
import styled from '@emotion/native';
import { Snackbar } from 'react-native-paper';
import Button from './Button';
import React from 'react';
import type { Node } from 'react';

const Notification = ({
  children,
  color,
  onDismiss,
  actionLabel,
  ...props
}: NotificationProps): Node => {
  return (
    <NotificationWrap
      onDismiss={onDismiss}
      color={color}
      wrapperStyle={WRAPPER_STYLE}
      action={{
        label: (
          <Button color={color} onPress={onDismiss}>
            {actionLabel}
          </Button>
        ),
      }}
      {...props}>
      {children}
    </NotificationWrap>
  );
};

type NotificationProps = {
  /**
   * Whether the Notification is visible.
   */
  visible: boolean,
  /**
   * The duration for which the Notification is shown.
   */
  duration?: number,
  /**
   * Color of the Notification.
   */
  color?: string,
  /**
   * Label for the action button of Notification.
   */
  actionLabel?: string,
  /**
   * Callback that is called when the user dismisses the Notification.
   */
  onDismiss: () => void,
  /**
   * Content of the Notification.
   */
  children: Node,
};

Notification.defaultProps = {
  visible: false,
  duration: 10000,
  actionLabel: 'Hide',
  color: 'notification',
};

const NotificationWrap = styled(Snackbar)(({ theme, color }) => ({
  padding: theme.layout.space(0.5),
  borderRadius: theme.roundness,
  backgroundColor: theme.colors[color],
}));

const WRAPPER_STYLE = { zIndex: 10 };

export default Notification;
