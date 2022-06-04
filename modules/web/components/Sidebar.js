/**
 * @format
 * @flow strict-local
 */
import React, { createContext, useContext } from 'react';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import _ from 'lodash';

import {
  useLinkBuilder,
  useLinkProps,
  useNavigation,
} from '@react-navigation/native';
import styled from '@emotion/native';
import { Badge, Divider, Drawer, List } from 'react-native-paper';
import Text from '@appComponents/Text';
import { logOut } from '@appUtils/auth';
import { useTripList } from '@appUtils/api';
import { versionFormat } from '@appUtils/app';

import AppLogo from '../../../assets/logo/app-logo.svg';
import pkg from '../../../package.json';
import { AccountState, useAccountRequests } from '@appUtils/manager';

const Sidebar = props => {
  const focusedRoute = props.state.routes[props.state.index];
  const focusedDescriptor = props.descriptors[focusedRoute.key];
  const focusedOptions = focusedDescriptor.options;

  const tripsCount = useTripsCount();
  const userRequestCount = useAccountRequestsCount();

  const { drawerContentStyle, drawerContentContainerStyle } = focusedOptions;

  return (
    <DrawerContent>
      <AppLogo style={logoStyle} width={152} height={50} />
      <NavDivider mt={1.5} />

      <DrawerContentScrollView
        contentContainerStyle={[
          contentContainerStyle,
          drawerContentContainerStyle,
        ]}
        style={drawerContentStyle}>
        <DrawerState.Provider value={focusedRoute}>
          <NavSection pt={0}>
            <NavItem name="Trips" badge={tripsCount} />
            <NavItem name="Messages" badge={0} disabled />
            <NavItem name="Aircraft" badge={0} />
            <NavItem name="Owners" badge={0} />
            <NavItem name="Pilots" badge={0} />
            <NavItem
              name="Account Requests"
              label="Account Requests"
              badge={userRequestCount}
            />
          </NavSection>
          <NavDivider />

          <NavSection pt={0}>
            <NavItem name="Archived">
              <NavItem name="Archived Trips" />
              <NavItem name="Archived Messages" disabled />
              <NavItem name="Archived Aircraft" disabled />
              <NavItem name="Archived Owners" disabled />
              <NavItem name="Archived Pilots" disabled />
            </NavItem>
            <NavItem name="Settings" />
            {__DEV__ && <NavItem name="Playground" />}
          </NavSection>

          <LogoutSection pt={0}>
            <WideItem icon="logout" label="Logout" onPress={logOut} />
          </LogoutSection>
        </DrawerState.Provider>
      </DrawerContentScrollView>

      <DrawerFooter />
    </DrawerContent>
  );
};

const useTripsCount = () => {
  const { snapshot, loading } = useTripList(tripRequestsRef);
  return loading ? 0 : snapshot.size;
};

const useAccountRequestsCount = () => {
  const { snapshot } = useAccountRequests([AccountState.NEW]);
  return snapshot?.size ?? 0;
};

const tripRequestsRef = ref =>
  ref.collection('trips').where('state', '==', 'Owner Request');

const DrawerState = createContext({});

const NavItem = ({ name, disabled, badge, children, ...props }) => {
  const buildLink = useLinkBuilder();
  const focusedRoute = useContext(DrawerState);
  const linkTo =
    React.Children.count(children) > 0
      ? _.get(children, [0, 'props', 'name'])
      : name;

  const { onPress, ...linkProps } = useLinkProps({ to: { screen: linkTo } });
  linkProps.href = buildLink(linkTo);

  const hasActiveChild = React.Children.toArray(children).some(
    child => focusedRoute.name === child.props.name,
  );

  const active = focusedRoute.name === name || hasActiveChild;
  const label = props.label || name.split(' ').pop();
  const icon = props.icon || label.toLowerCase().replaceAll(' ', '-');

  return (
    <>
      <WideItem
        label={label}
        active={active}
        icon={icon}
        right={badge ? () => <NavBadge>{badge}</NavBadge> : undefined}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        {...(!disabled && linkProps)}
      />
      {children && active && <AccordionContent>{children}</AccordionContent>}
    </>
  );
};

const DrawerFooter = () => {
  const { navigate } = useNavigation();

  return (
    <>
      <DrawerFooterLayout>
        <FooterLink onPress={() => navigate('Terms')}>Terms</FooterLink>
        <FooterLink color="dark">|</FooterLink>
        <FooterLink onPress={() => navigate('Privacy')}>Privacy</FooterLink>
      </DrawerFooterLayout>

      <Text align="center" color="dark" size={12} font="medium">
        v {versionFormat(pkg.version)}
      </Text>
    </>
  );
};

const logoStyle = { margin: 'auto' };

const contentContainerStyle = { height: '100%' };

const NavDivider = styled(Divider)(({ theme, mt = 0.5 }) => ({
  marginTop: theme.layout.space(mt),
  marginBottom: theme.layout.space(0.5),
  marginHorizontal: theme.layout.space(1.875),
}));

const DrawerContent = styled.View(({ theme }) => ({
  paddingTop: theme.layout.space(2),
  paddingBottom: theme.layout.space(1.5),
  width: '100%',
  height: theme.layout.height,
  backgroundColor: theme.colors.background,
}));

const DrawerFooterLayout = styled.View(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: theme.layout.space(1),
  paddingBottom: theme.layout.gap(2),
}));

const NavSection = styled(List.Section)(({ theme, pt = 2 }) => ({
  paddingTop: theme.layout.verticalSpace(pt),
}));

const LogoutSection = styled(NavSection)(() => ({
  marginTop: 'auto',
}));

const WideItem = styled(Drawer.Item)(({ theme, disabled }) => ({
  marginHorizontal: theme.layout.gap(2.5),
  marginVertical: theme.layout.gap(0.25),
  ...(disabled && { opacity: 0.33, pointerEvents: 'none' }),
}));

const AccordionContent = styled.View(({ theme }) => ({
  marginLeft: theme.layout.space(1.25),
}));

const NavBadge = styled(Badge)`
  align-self: center;
`;

const FooterLink = styled(Text)`
  font-size: 12px;
  margin: 0 2px;
`;

FooterLink.defaultProps = {
  accessibilityRole: 'link',
  color: 'primary',
};

export default Sidebar;
