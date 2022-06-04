/**
 * @file
 * Theme configuration
 * Reference structure and specifics here
 * - https://callstack.github.io/react-native-paper/theming.html
 * - https://reactnavigation.org/docs/themes/
 *
 * @format
 * @flow strict-local
 */

import {
  configureFonts,
  DefaultTheme as DefaultThemePaper,
} from 'react-native-paper';
import type { Theme as NavigationTheme } from '@react-navigation/native';
import { DefaultTheme as DefaultThemeNavigation } from '@react-navigation/native';
import merge from 'deepmerge';
import makePalette from './makePalette';

export default function createTheme(params): FlightWorksTheme {
  const colors = makePalette(params.colorScheme);
  const fonts = makeFonts(params.fontScale);
  const layout = makeLayout(params);

  const theme = merge.all([
    DefaultThemeNavigation,
    DefaultThemePaper,
    {
      roundness: 4,
      dark: false,
      colors,
      fonts,
      layout,
    },
  ]);

  return theme;
}

const makeFonts = scaleFactor => {
  const config = {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
    numbers: {
      fontFamily: 'monospace',
      fontWeight: 'normal',
    },
  };

  const fonts = configureFonts(config);

  const size = {
    smallest: 12 * scaleFactor,
    small: 14 * scaleFactor,
    medium: 16 * scaleFactor,
    mediumLarge: 18 * scaleFactor,
    large: 20 * scaleFactor,
    larger: 24 * scaleFactor,
    extraLarge: 28 * scaleFactor,
    extraExtraLarge: 32 * scaleFactor,
    largest: 36 * scaleFactor,
  };

  return {
    ...fonts,
    size,
  };
};

const makeLayout = ({ width, height, scale }) => {
  const orientation = {
    portrait: width < height,
    landscape: width >= height,
  };

  const horizontalFactor = orientation.portrait ? 2 : 4;
  const verticalFactor = orientation.portrait ? 4 : 2;

  const gap = (size = 1) => size * horizontalFactor;
  gap.toString = () => horizontalFactor;
  const verticalGap = (size = 1) => size * verticalFactor;
  verticalGap.toString = () => verticalFactor;

  const space = (size = 1) => size * 4 * horizontalFactor;
  space.toString = () => horizontalFactor * 4;
  const verticalSpace = (size = 1) => size * 4 * verticalFactor;
  verticalSpace.toString = () => verticalFactor * 4;

  return {
    orientation,
    gap,
    horizontalGap: gap,
    verticalGap,
    space,
    horizontalSpace: space,
    verticalSpace,
    width,
    height,
    scale,
  };
};

type FontSize = {|
  smallest: number,
  small: number,
  medium: number,
  mediumLarge: number,
  large: number,
  larger: number,
  extraLarge: number,
  extraExtraLarge: number,
  largest: number,
|};

export type Size = $Keys<FontSize>;

export type FlightWorksTheme = NavigationTheme &
  ReactNativePaper.Theme & {
    fonts: ReactNativePaper.ThemeFonts & { size: FontSize },
    colors: ReactNativePaper.ThemeColors & { dark: string },
    layout: {
      /**
       * Use for small layout padding/margin
       */
      gap: number => number,
      /**
       * Use for larger layout padding/margin
       */
      space: number => number,
      orientation: {
        portrait: boolean,
        landscape: boolean,
      },
    },
  };
