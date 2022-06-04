/**
 * @file
 * Our custom App Icons
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect } from 'react';
import { View, Text, StyleProp } from 'react-native';
import { kebabCase } from 'lodash';

import * as icons from './icons';

const iconsMap = new Map(
  Object.keys(icons).map(name => [kebabCase(name), icons[name]]),
);

export const Icon = ({
  name,
  allowFontScaling,
  style,
  color = '#A6A6A6',
  size = 16,
  stroke,
  fill,
  opacity = 1,
  ...props
}: IconProps): Node => {
  const SvgComponent = iconsMap.get(name) || BlankIcon;

  return (
    <View
      accessibilityRole="image"
      pointerEvents="none"
      style={[style, { color }]}
      {...props}>
      <SvgComponent
        fill={fill || color}
        stroke={stroke}
        name={name}
        width={size}
        height={size}
        opacity={opacity}
      />
    </View>
  );
};

const BlankIcon = props => {
  useEffect(() => {
    console.warn(`Missing icon for "${props.name}"`);
  }, [props.name]);

  return <Text {...props}>□</Text>;
};

export type IconProps = {
  name: string,
  color?: string,
  size?: number,
  allowFontScaling?: boolean,
  style?: StyleProp,
  stroke?: string,
  fill?: string,
  opacity?: number,
};

export default Icon;
