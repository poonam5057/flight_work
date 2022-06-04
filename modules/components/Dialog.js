/**
 * @file
 * Our custom Dialog
 *
 * @format
 * @flow strict-local
 */
import React, { useCallback, useState } from 'react';
import type { Node } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { Portal, Dialog as NativeDialog } from 'react-native-paper';
import styled from '@emotion/native';

import { Icon } from './theme';
import Text, { Title } from './Text';
import Button from './Button';
import { Spacer } from './ScreenLayout';

const Dialog = ({
  children,
  title,
  actionSlot,
  onDismiss,
  ...props
}: DialogProps): Node => (
  <Portal>
    <DialogWrap onDismiss={onDismiss} {...props}>
      <DialogTitleWrap>
        {title && <Title>{title}</Title>}
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss}>
            <Icon
              name="close"
              color={Platform.OS === 'ios' ? 'white' : 'dark'}
              size={24}
            />
          </TouchableOpacity>
        )}
      </DialogTitleWrap>
      <DialogContent>{children}</DialogContent>
      {Boolean(actionSlot) && <DialogActions>{actionSlot}</DialogActions>}
    </DialogWrap>
  </Portal>
);

type DialogProps = {
  /**
   * Title of the Dialog.
   */
  title?: string,
  /**
   * Whether clicking outside the Dialog dismiss it.
   */
  dismissable?: boolean,
  /**
   * Whether the Dialog is visible.
   */
  visible: boolean,
  /**
   * Callback that is called when the user dismisses the Dialog.
   */
  onDismiss?: () => void,
  /**
   * Slot for action buttons of the Dialog.
   */
  actionSlot?: Node,
  /**
   * Content of the Dialog.
   */
  children: Node,
};

/**
 * Make an action require confirmation
 * When the action is invoked a confirm dialog would be displayed
 * The actual action will be triggered when the "Confirm" button is pressed
 * Append the `confirmationNode` in the component tree where this confirmation is used.
 * It'll only be rendered when the confirmation should be visible
 * @param input
 * @returns {{confirmationNode: JSX.Element, confirm: (function(...[*]): void)}}
 */
export const useConfirmation = (input: ConfirmationInput) => {
  const [onConfirm, setOnConfirm] = useState(false);
  const discardConfirm = useCallback(() => setOnConfirm(false), []);

  const { action, onCancel } = input;

  const confirm = useCallback(
    (...args) => {
      setOnConfirm(() => () => {
        action(...args);
        setOnConfirm(false);
      });
    },
    [action],
  );

  const cancelAction = useCallback(() => {
    onCancel?.();
    setOnConfirm(false);
  }, [onCancel]);

  const {
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    dismissable = true,
  } = input;

  const confirmationNode = (
    <Dialog
      title={input.title}
      visible={Boolean(onConfirm)}
      onDismiss={dismissable ? discardConfirm : undefined}
      dismissable={dismissable}
      actionSlot={[
        <Button
          key="cancel"
          mode="outlined"
          color="dark"
          onPress={cancelAction}>
          {cancelText}
        </Button>,
        <Spacer key="spacer" dir="horizontal" />,
        <Button key="confirm" onPress={onConfirm}>
          {confirmText}
        </Button>,
      ]}>
      {input.message && <Text>{input.message}</Text>}
    </Dialog>
  );

  return { confirm, confirmationNode };
};

type ConfirmationInput = {
  title: string,
  message?: string,
  action(...args): void,
  cancelText?: string,
  confirmText?: string,
  onCancel?: () => void,
  dismissable?: boolean,
};

const DialogWrap = styled(NativeDialog)`
  width: 90%;
  max-width: 800px;
  align-self: center;
`;

const DialogTitleWrap = styled.View(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.layout.space(2),
}));

const DialogContent = styled(NativeDialog.Content)(({ theme }) => ({
  paddingHorizontal: theme.layout.space(2),
  paddingBottom: theme.layout.space(2),
  flex: 1,
}));

const DialogActions = styled(NativeDialog.Actions)(({ theme }) => ({
  paddingTop: 0,
  paddingBottom: theme.layout.space(1.5),
  paddingHorizontal: theme.layout.space(2),
}));

export default Dialog;
