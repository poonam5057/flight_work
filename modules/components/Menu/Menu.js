/**
 * @file
 * Our custom Menu Component
 *
 * @example
 * const MenuExample = () => {
 *  const { anchorEl, isOpen, open, close } = useMenuState();
 *
 *  return (
 *   <>
 *    <Button color="accent" onPress={open} ref={anchorEl}>
 *     Show Menu
 *    </Button>
 *    <Menu anchorEl={anchorEl} visible={isOpen} onDismiss={close}>
 *     <MenuItem title="Menu Item 1" icon="aircraft" />
 *     <MenuItem title="Menu Item 2" icon="aircraft" />
 *     <MenuItem title="Menu Item 3" icon="aircraft" />
 *    </Menu>
 *   </>
 *   );
 *  };
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import type { Node, Element } from 'react';
import { Platform } from 'react-native';
import { Menu as NativeMenu } from 'react-native-paper';
import styled from '@emotion/native';

export const Menu = ({
  children,
  anchor,
  anchorOffset,
  style,
  contentStyle,
  arrowVisible,
  ...props
}: MenuProps): Node => {
  const [anchorPos, setAnchorPos] = React.useState({ x: 10, y: 10 });

  React.useEffect(() => {
    if (anchor?.x && anchor?.y) {
      setAnchorPos(anchor);
      return;
    }

    const rect = anchor?.getBoundingClientRect();

    if (rect) {
      const x = rect.x + rect.width + anchorOffset.x;
      const y = rect.y + anchorOffset.y;

      setAnchorPos({ x, y });
    }
  }, [anchor, anchorOffset.x, anchorOffset.y]);

  return (
    <NativeMenu
      anchor={anchorPos}
      style={[MENU_STYLE, style]}
      contentStyle={[CONTENT_STYLE, contentStyle]}
      {...props}>
      {Platform.OS === 'web' && arrowVisible && (
        <MenuArrow x={anchorOffset.x} y={anchorOffset.y} />
      )}
      {children}
    </NativeMenu>
  );
};

type MenuProps = {
  /**
   * Whether the Menu is currently visible.
   */
  visible: boolean,
  /**
   * Whether the anchor's arrow is currently visible for Web.
   */
  arrowVisible?: boolean,
  /**
   * The anchor element to open the menu from. Use `useMenuState` hook to get/pass it.
   */
  anchor: Element | { x: number, y: number },
  /**
   * Additional anchor offset.
   */
  anchorOffset?: { x: number, y: number },
  /**
   * Callback called when Menu is dismissed. The `visible` prop needs to be updated when this is called.
   */
  onDismiss: () => void,
  /**
   * Content of the `Menu`.
   */
  children: Node,
};

Menu.defaultProps = {
  anchorOffset: { x: 16, y: -20 },
};

const MenuArrow = styled.View(({ theme, x, y }) => ({
  position: 'absolute',
  width: 0,
  height: 0,
  left: 1,
  top: Math.abs(y) + 2,
  borderWidth: Math.abs(x / 1.5),
  borderStyle: 'solid',
  borderTopColor: 'transparent',
  borderBottomColor: theme.colors.surface,
  borderLeftColor: theme.colors.surface,
  borderRightColor: 'transparent',
  boxShadow: '-3px 3px 6px -3px rgba(0, 0, 0, 0.24)',
  transform: 'rotate(45deg)',
  transformOrigin: '0 0',
}));

const MENU_STYLE = {
  paddingHorizontal: 0,
};

const CONTENT_STYLE = {
  padding: 10,
};
