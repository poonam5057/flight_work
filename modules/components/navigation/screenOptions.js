/**
 * @file
 * Default screen options used as fallback when none are provided
 * These include reusable styles and other reusable settings
 * The exports here are meant to be used only by the files inside `./navigation`
 * We shouldn't import these in other modules
 *
 * @format
 * @flow strict-local
 */

import React, { useMemo } from 'react';
import { merge } from 'lodash';
import color from 'color';

import { Icon, useTheme } from '../theme';

export const useWebScreenOptions = (overrides: ScreenOptions): ScreenOptions => {
  const theme = useTheme();

  return useMemo(() => {
    const defaultOptions = {
      headerTintColor: theme.colors.dark,
      headerBackImage: () => (
        <Icon name="arrow" color={theme.colors.dark} size={20} />
      ),
      headerTitleStyle: {
        fontSize: theme.fonts.size.larger,
      },
      headerStyle: {
        height: 72,
        backgroundColor: color(theme.colors.background).darken(0.04).hex(),
        borderBottomWidth: 0,
      },
      headerLeftContainerStyle: {
        paddingLeft: theme.layout.space(2),
      },
      headerRightContainerStyle: {
        paddingRight: theme.layout.space(2),
      },
    };

    const screenOptions = merge(defaultOptions, overrides);

    return screenOptions;
  }, [
    overrides,
    theme.colors.background,
    theme.colors.dark,
    theme.fonts.size.larger,
    theme.layout,
  ]);
};

export const useNativeScreenOptions = (overrides: ScreenOptions): ScreenOptions => {
  const theme = useTheme();

  return useMemo(() => {
    const defaultOptions = {
      headerBackImage: () => (
        <Icon name="arrow" color={theme.colors.primary} size={20} />
      ),
      headerTitleStyle: {
        fontSize: theme.fonts.size.larger,
        color: theme.colors.heading,
      },
      headerStyle: {
        height: 72,
        backgroundColor: color(theme.colors.header).hex(),
        borderBottomWidth: 0,
      },
      headerLeftContainerStyle: {
        paddingLeft: theme.layout.space(2),
      },
      headerRightContainerStyle: {
        paddingRight: theme.layout.space(2),
      },
    };

    const screenOptions = merge(defaultOptions, overrides);

    return screenOptions;
  }, [
    overrides,
    theme.colors.header,
    theme.colors.heading,
    theme.colors.primary,
    theme.fonts.size.larger,
    theme.layout,
  ]);
};

export type ScreenOptions = {
  headerTintColor: string,
  headerBackImage: () => Node,
  headerTitleStyle: {
    fontSize: number,
  },
  headerStyle: {
    height: number,
  },
  headerLeft?: Node | false,
  headerLeftContainerStyle?: {},
  headerRightContainerStyle?: {},
};
