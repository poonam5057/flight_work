/**
 * @file
 * Our custom Tabs
 * See documentation: https://github.com/satya164/react-native-tab-view for additional props
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import {
  TabView,
  TabBar as NativeTabBar,
  SceneMap,
} from 'react-native-tab-view';
import type { Node } from 'react';
import color from 'color';
import { useTheme } from './theme';

const Tabs = ({
  tabIndex: index,
  onIndexChange,
  onTabPress,
  routes = [],
  tabBarInline,
  style,
  ...rest
}: TabsProps): Node => {
  const theme = useTheme();
  const scenes = routes.reduce((res, route) => {
    res[route.key] = route.content || (() => null);
    return res;
  }, {});

  return (
    <TabView
      navigationState={{ index, routes }}
      onIndexChange={onIndexChange}
      renderTabBar={props => (
        <TabBar
          {...props}
          tabBarInline={tabBarInline}
          onTabPress={onTabPress}
        />
      )}
      renderScene={SceneMap(scenes)}
      initialLayout={{ width: theme.layout.width }}
      style={[{ maxWidth: '100%' }, style]}
      sceneContainerStyle={{ borderRadius: theme.roundness }}
      {...rest}
    />
  );
};

type TabsProps = {
  /**
   * Current/Initial tab index
   */
  tabIndex: number,
  /**
   * Whether the tab bar items should take their original width or not
   */
  tabBarInline?: boolean,
  /**
   * Callback which is called on tab change, receives the index of the new tab as argument.
   */
  onIndexChange?: () => void,
  /**
   * Callback called immediately when a tab is pressed
   */
  onTabPress?: Object => void,
  /**
   * Array containing a list of route objects used for rendering the tabs
   */
  routes?: Array<{
    key: string,
    title: string,
    icon?: string,
    content: Node,
  }>,
};

const TabBar = ({ tabBarInline, onTabPress, ...props }): Node => {
  const theme = useTheme();
  const styles = getTabBarStyles({ theme, tabBarInline });

  return (
    <NativeTabBar
      {...props}
      onTabPress={onTabPress}
      style={styles.main}
      tabStyle={styles.tabStyle}
      labelStyle={styles.labelStyle}
      indicatorStyle={styles.indicatorStyle}
      activeColor={styles.activeColor}
      pressColor={styles.indicatorStyle.borderBottomColor}
    />
  );
};

const getTabBarStyles = ({ theme, tabBarInline = false }) => {
  return {
    activeColor: theme.colors.dark,
    main: {
      backgroundColor: 'transparent',
      ...(tabBarInline && { marginHorizontal: theme.layout.space(1.5) }),
      shadowOpacity: 0,
    },
    tabStyle: {
      paddingHorizontal: theme.layout.space(1.25),
      ...(tabBarInline && { width: 'auto' }),
    },
    labelStyle: {
      color: color(theme.colors.surface).darken(0.61).hex(),
      fontWeight: '500',
    },
    indicatorStyle: {
      height: '100%',
      backgroundColor: color(theme.colors.surface).darken(0.14).hex(),
      borderBottomWidth: 2,
      borderBottomStyle: 'solid',
      borderBottomColor: theme.colors.primary,
    },
  };
};

export default Tabs;
