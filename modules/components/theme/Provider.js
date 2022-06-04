/**
 * @file
 * Common theme provider
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { ThemeProvider as EmotionTheme } from '@emotion/react';
import {
  Provider as PaperProvider,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { useColorScheme, useWindowDimensions } from 'react-native';
import createTheme, { FlightWorksTheme } from './createTheme';
import { Icon } from './Icon';

export const ThemeProvider = ({ children, ...themeProps }) => {
  const colorScheme = useColorScheme();
  const dimensions = useWindowDimensions();

  const theme = createTheme({ colorScheme, ...dimensions, ...themeProps });
  const settings = { icon: renderIcon };

  return (
    <EmotionTheme theme={theme}>
      <PaperProvider theme={theme} settings={settings}>
        {children}
      </PaperProvider>
    </EmotionTheme>
  );
};

export const useTheme: () => $ReadOnly<FlightWorksTheme> = usePaperTheme;

const renderIcon = props => <Icon {...props} />;
