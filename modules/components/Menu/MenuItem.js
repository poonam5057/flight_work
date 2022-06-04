/**
 * @file
 * Our custom Menu Item Component
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import type { Node } from 'react';
import { Menu as NativeMenu } from 'react-native-paper';
import color from 'color';
import { useTheme } from '../theme';

export const MenuItem = ({
  icon,
  active,
  subItem,
  style,
  contentStyle,
  titleStyle,
  ...props
}: MenuItemProps) => {
  const theme = useTheme();

  const { container, content, title } = getStyles({
    theme,
    active,
    subItem,
    hasIcon: Boolean(icon),
  });

  return (
    <NativeMenu.Item
      icon={icon}
      style={[container, style]}
      titleStyle={[title, titleStyle]}
      contentStyle={[content, contentStyle]}
      {...props}
    />
  );
};

type MenuItemProps = {
  /**
   * Title text for the MenuItem.
   */
  title: Node,
  /**
   * Icon to display for the MenuItem.
   */
  icon?: string,
  /**
   * Whether the 'item' is active.
   */
  active?: boolean,
  /**
   * Whether the 'item' is disabled.
   */
  disabled?: boolean,
  /**
   * Whether the 'item' is styled as sub item. It has additional left spacing.
   */
  subItem?: boolean,
  /**
   * Function to execute on press.
   */
  onPress?: () => void,
};

const getStyles = ({ theme, active, subItem, hasIcon }) => ({
  container: {
    height: 44,
    paddingLeft: theme.layout.space(subItem ? 1.625 : 0.5),
    paddingRight: 0,
    borderRadius: 10,
    backgroundColor: active && color(theme.colors.primary).lightness(92).hex(),
  },
  content: {
    marginLeft: theme.layout.space(hasIcon ? -0.75 : 0.5),
    marginRight: 0,
  },
  title: {
    paddingHorizontal: 0,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: active
      ? theme.colors.dark
      : color(theme.colors.surface).darken(0.61).hex(),
  },
});
