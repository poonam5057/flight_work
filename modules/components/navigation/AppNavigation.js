import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { useTheme } from '../theme';

export function AppNavigation({ children, linking, ...props }): Node {
  const theme = useTheme();

  return (
    <NavigationContainer theme={theme} linking={linking} {...props}>
      {children}
    </NavigationContainer>
  );
}

export type { LinkingOptions } from '@react-navigation/native';
