/**
 * @file
 * Hooks related to Menu component
 */
import * as React from 'react';
import { Platform } from 'react-native';

export const useMenuState = ({ initialOpen = false } = {}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isOpen, setIsOpen] = React.useState(Boolean(initialOpen));
  const close = React.useCallback(() => setIsOpen(false), []);
  const open = React.useCallback(e => {
    setIsOpen(true);

    if (Platform.OS !== 'web') {
      setAnchorEl({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
      return;
    }

    if (e) {
      setAnchorEl(e.currentTarget);
    }
  }, []);

  return {
    anchorEl,
    open,
    close,
    isOpen,
  };
};
