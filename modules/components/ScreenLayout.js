/**
 * @file
 * Screen content layout
 *
 * @format
 * @flow strict-local
 */

import styled from '@emotion/native';
import type { Node } from 'react';
import type { FlexAlignType } from 'react-native';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Surface } from 'react-native-paper';
import color from 'color';
import _ from 'lodash';

export const ScreenLayout: (props: ScreenLayoutProps) => Node = styled.View(
  ({ theme, ...props }: ScreenLayoutProps) => ({
    flex: 1,
    alignItems: props.alignItems || 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.layout.space(props.paddingHorizontal),
    backgroundColor:
      props.color || color(theme.colors.background).darken(0.04).hex(),
  }),
);

type ScreenLayoutProps = {
  alignItems?: FlexAlignType,
  paddingHorizontal?: number,
  color?: String,
};

export const MainSurface = styled(Surface)(({ theme }) => ({
  flex: 1,
  marginHorizontal: theme.layout.space(1),
  marginBottom: theme.layout.space(1),
  borderRadius: theme.layout.space(1),
  minWidth: 1058,
}));

export const Header = styled.View(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: theme.layout.space(3),
  paddingVertical: theme.layout.gap(1.5),
}));

export const SectionHeader = styled.View(({ theme }) => ({
  minHeight: theme.layout.space(3),
  paddingHorizontal: theme.layout.space(1),
  flexDirection: 'row',
  alignItems: 'center',
  borderBottomWidth: 1,
  borderColor: color(theme.colors.surface).darken(0.14).hex(),
}));

export const SectionBody = styled.View(({ theme }) => ({
  paddingHorizontal: theme.layout.space(1),
  paddingVertical: theme.layout.space(0.25),
}));

export const ScreenLoader = styled(ActivityIndicator)(
  StyleSheet.absoluteFillObject,
);
ScreenLoader.defaultProps = {
  size: 'large',
};

export const Spacer: (props: SpacerProps) => Node = styled.View(
  ({ theme, size = 1, dir = 'vertical' }) =>
    dir === 'vertical'
      ? { height: theme.layout.space(size) }
      : { width: theme.layout.space(size) },
);

type SpacerProps = {
  size?: number,
  dir?: 'vertical' | 'horizontal',
};

type CircleProps = {
  size?: number,
  color?: string,
};

export const Circle: (props: CircleProps) => Node = styled.View(
  ({ theme, size = 12, ...props }) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: _.get(theme.colors, props.color, props.color),
  }),
);

export const Box: (props: BoxProps) => Node = styled.View(
  ({ theme, ...props }) => ({
    flexDirection: props.dir || 'column',
    flexWrap: props.wrap,
    alignItems: props.ai,
    justifyContent: props.jc,
    flex: props.flex,
    width: props.width,
    height: props.height,
    marginHorizontal: spacing(theme, props.mh),
    marginVertical: spacing(theme, props.mv),
    marginLeft: spacing(theme, props.ml),
    marginRight: spacing(theme, props.mr),
    marginTop: spacing(theme, props.mt),
    marginBottom: spacing(theme, props.mb),
    paddingHorizontal: spacing(theme, props.ph),
    paddingVertical: spacing(theme, props.pv),
    paddingLeft: spacing(theme, props.pl),
    paddingRight: spacing(theme, props.pr),
    paddingTop: spacing(theme, props.pt),
    paddingBottom: spacing(theme, props.pb),
  }),
);

const spacing = (theme, val) =>
  Number.isFinite(val) ? theme.layout.space(val) : val;

type BoxProps = {
  /**
   * Flex direction
   */
  dir?: 'column' | 'row',
  flex?: number,
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse',
  width?: string | number,
  height?: string | number,
  /**
   * Margin left
   */
  ml?: string | number,
  /**
   * Margin right
   */
  mr?: string | number,
  /**
   * Margin horizontal
   */
  mh?: string | number,
  /**
   * Margin vertical
   */
  mv?: string | number,
  /**
   * Margin top
   */
  mt?: string | number,
  /**
   * Margin bottom
   */
  mb?: string | number,
  /**
   * Align Items
   */
  ai?: FlexAlignType,
  /**
   * Justify Content
   */
  jc?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly',
  /**
   * Padding left
   */
  pl?: string | number,
  /**
   * Padding right
   */
  pr?: string | number,
  /**
   * Padding horizontal
   */
  ph?: string | number,
  /**
   * Padding vertical
   */
  pv?: string | number,
  /**
   * Padding top
   */
  pt?: string | number,
  /**
   * Padding bottom
   */
  pb?: string | number,
};
