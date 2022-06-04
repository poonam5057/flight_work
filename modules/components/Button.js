/**
 * @file
 * Our custom Button
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import type { Node } from 'react';
import { useLinkBuilder, useLinkProps } from '@react-navigation/native';
import { Button as NativeButton } from 'react-native-paper';
import styled from '@emotion/native';
import { Icon, useTheme } from './theme';

const Button = ({
  children,
  mode,
  style,
  labelStyle,
  dark,
  color,
  stroke,
  disabled,
  icon,
  iconSize,
  ml,
  mr,
  mt,
  aSelf,
  ...props
}: ButtonProps): Node => {
  const theme = useTheme();

  const hasChild = React.Children.count(children) > 0;

  const labelStyles = getLabelStyle({ mode, hidden: !hasChild });
  const buttonStyles = getButtonStyles({
    theme,
    mode,
    color: disabled ? 'disabled' : color,
    ml,
    mr,
    mt,
    aSelf,
    iconOnly: icon && !hasChild,
    iconSize,
  });

  const contentStyles = getContentStyles(icon && !hasChild, iconSize);

  const iconStyle = !hasChild && { marginLeft: theme.layout.space(-1) };
  const buttonIcon = icon && {
    icon: getIcon({ iconName: icon, iconSize, style: iconStyle, stroke }),
  };

  return (
    <NativeButton
      mode={mode}
      style={[buttonStyles, style]}
      labelStyle={[labelStyles, labelStyle]}
      contentStyle={contentStyles}
      disabled={disabled}
      color={buttonStyles.color}
      {...buttonIcon}
      {...props}>
      {children}
    </NativeButton>
  );
};

export const LinkButton = ({ toScreen, params, action, ...rest }) => {
  const buildLink = useLinkBuilder();
  const linkProps = useLinkProps({ to: { screen: toScreen, params }, action });
  linkProps.href = buildLink(toScreen, params);
  return <Button {...(!rest.disabled && linkProps)} {...rest} />;
};

export const BorderedButton = styled(Button)(({ theme, color }) => ({
  justifyContent: 'center',
  borderColor: theme.colors[color] ?? color,
  borderWidth: 1,
}));

BorderedButton.defaultProps = {
  labelStyle: { fontWeight: '700' },
  mode: 'outlined',
  color: 'secondary',
};

type ButtonProps = {
  /**
   * Mode of the button.
   */
  mode?: 'text' | 'outlined' | 'contained',
  /**
   * Icon to display for the Button.
   */
  icon?: string,
  /**
   * Size of the Icon displayed for the Button.
   */
  iconSize?: number,
  /**
   * Use a compact look, useful for `text` buttons in a row.
   */
  compact?: boolean,
  /**
   * Custom text color for flat button, or background color for contained button.
   */
  color?: 'primary' | 'accent' | 'dark' | 'error',
  /**
   * Whether to show a loading indicator.
   */
  loading?: boolean,
  /**
   * Whether the button is disabled.
   */
  disabled?: boolean,
  /**
   * Make the label text uppercased. Note that this won't work if you pass React elements as children.
   */
  uppercase?: boolean,
  /**
   * Accessibility label for the button.
   */
  accessibilityLabel?: string,
  /**
   * Function to execute on press.
   */
  onPress?: () => void,
  /**
   * Function to execute on long press.
   */
  onLongPress?: () => void,
  /**
   * Label text of the button.
   */
  children?: Node,
  /**
   * Margin left, use "auto" to push a button to the end
   */
  ml?: string | number,
  /**
   * Margin right
   */
  mr?: string | number,
  /**
   * Margin top
   */
  mt?: string | number,
  /**
   * Align self
   */
  aSelf?: string,
};

Button.defaultProps = {
  color: 'primary',
  mode: 'contained',
  dark: true,
  compact: false,
  uppercase: true,
  iconSize: 24,
};

const getButtonStyles = ({
  theme,
  mode,
  color,
  ml,
  mr,
  mt,
  aSelf,
  iconOnly,
  iconSize,
}) => ({
  boxShadow: 'none',
  color: theme.colors[color],
  ...(mode === 'contained' && { backgroundColor: theme.colors[color] }),
  marginLeft: ml > 0 ? theme.layout.space(ml) : ml,
  marginRight: mr > 0 ? theme.layout.space(mr) : mr,
  marginTop: mt > 0 ? theme.layout.space(mt) : mt,
  ...(iconOnly && {
    justifyContent: 'center',
    minHeight: iconSize * 1.5,
    minWidth: iconSize * 1.5,
  }),
  borderColor: theme.colors[color],
  alignSelf: aSelf,
});

const getLabelStyle = ({ mode, hidden }) => ({
  marginVertical: hidden ? 0 : 10,
  marginHorizontal: hidden ? 0 : 14,
  ...(mode === 'contained' && { color: '#ffffff' }),
});

const getContentStyles = (iconOnly, iconSize) =>
  iconOnly && {
    height: iconSize * 1.5,
    width: iconSize * 1.5,
  };

const getIcon =
  ({ iconName, iconSize, style, stroke }) =>
  ({ size, color }) =>
    (
      <Icon
        name={iconName}
        size={iconSize || size}
        color={color}
        stroke={stroke}
        style={style}
      />
    );

export default Button;
