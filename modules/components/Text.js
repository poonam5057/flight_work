/**
 * @file
 * Our custom Text Component
 *
 * @format
 * @flow strict-local
 */
import type { Node } from 'react';
import * as React from 'react';
import { get } from 'lodash';
import styled from '@emotion/native';
import type { Size } from './theme/createTheme';

const Text = ({ children, ...props }: TextProps): Node => (
  <TextWrap {...props}>{children}</TextWrap>
);

export const Title = ({ children, ...props }): Node => (
  <Text color="dark" size="larger" weight="bold" {...props}>
    {children}
  </Text>
);

export const PersonText = ({
  entry,
  size = 'medium',
  color = 'dark',
  fallback = '-',
  ...rest
}) => (
  <Text size={size} color={color} {...rest}>
    {entry ? `${entry.firstName} ${entry.lastName}` : fallback}
  </Text>
);

type TextProps = {
  size?: Size,
  // Line Height
  lh?: number,
  // Letter Spacing
  ls?: number,
  color?: 'text' | 'dark' | 'primary' | 'secondary' | 'heading',
  font?: 'regular' | 'medium' | 'light' | 'thin',
  weight?: string | number,
  align?: 'left' | 'right' | 'center',
  opacity?: number,
  children: Node,
};

const TextWrap = styled.Text(
  ({ theme, color = 'text', size, font, align, weight, opacity, lh, ls }) => ({
    ...theme.fonts[font || 'regular'],
    color: get(theme.colors, color, color),
    fontSize: get(theme.fonts.size, [size], theme.fonts.size.small),
    textAlign: align,
    fontWeight: weight,
    opacity: opacity,
    lineHeight: lh,
    letterSpacing: ls,
  }),
);

export default Text;
