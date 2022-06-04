/**
 * @format
 * @flow strict-local
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Drawer } from '@appComponents/navigation';
import UserMenu from '@appComponents/UserMenu';

import Sidebar from '../../components/Sidebar';
import Blank from './Blank';
import Playground from './Playground';
import Trips from './Trips';
import TripBuilder from './TripBuilder';
import Trip from './Trip';
import Aircraft from './Aircraft';
import AircraftDetails from './AircraftDetails';
import Owners from './Owners';
import Pilots from './Pilots';
import AccountRequests from './AccountRequests';
import Settings from './Settings';
import ArchivedTrips from './ArchivedTrips';

import { useMyData } from '@appUtils/api';

// Todo: extract the drawer toggle here

export default function Screens() {
  const [user, loading] = useMyData();
  const { drawerWidth, drawerContent } = useDrawerContent();
  const options = useScreenOptions({ drawerWidth, user, loading });

  return (
    <Drawer.Navigator
      drawerContent={drawerContent}
      defaultStatus="open"
      backBehavior="history"
      screenOptions={options}>
      <Drawer.Group screenOptions={groupOptions}>
        <Drawer.Screen name="Trips" component={Trips} />
        <Drawer.Screen name="Messages" component={Blank} />
        <Drawer.Screen name="Aircraft" component={Aircraft} />
        <Drawer.Screen name="Owners" component={Owners} />
        <Drawer.Screen name="Pilots" component={Pilots} />
        <Drawer.Screen name="Account Requests" component={AccountRequests} />
        <Drawer.Screen name="Settings" component={Settings} />
        {__DEV__ && <Drawer.Screen name="Playground" component={Playground} />}
      </Drawer.Group>

      <Drawer.Group screenOptions={groupOptions}>
        <Drawer.Screen
          name="Trip Builder"
          component={TripBuilder}
          options={{ unmountOnBlur: false }}
        />
        <Drawer.Screen name="Trip" component={Trip} />
        <Drawer.Screen name="Aircraft Details" component={AircraftDetails} />

        <Drawer.Screen name="Archived Trips" component={ArchivedTrips} />
        <Drawer.Screen name="Archived Messages" component={Blank} />
        <Drawer.Screen name="Archived Aircraft" component={Blank} />
        <Drawer.Screen name="Archived Owners" component={Blank} />
        <Drawer.Screen name="Archived Pilots" component={Blank} />
      </Drawer.Group>
    </Drawer.Navigator>
  );
}

const useDrawerContent = () => {
  const [drawerWidth, setDrawerWidth] = useState(260);

  const drawerContent = useCallback(
    props => (
      <Sidebar
        drawerWidth={drawerWidth}
        setDrawerWidth={setDrawerWidth}
        {...props}
      />
    ),
    [drawerWidth],
  );

  return { drawerWidth, drawerContent };
};

const useScreenOptions = ({ drawerWidth = 260, user, loading }) =>
  useMemo(
    () => ({
      drawerType: 'permanent',
      headerLeft: false,
      unmountOnBlur: true,
      headerRight: headerRightProps => (
        <UserMenu user={!loading && user} {...headerRightProps} />
      ),
      drawerStyle: {
        width: drawerWidth,
      },
    }),
    [drawerWidth, loading, user],
  );

const groupOptions = ({ route }) => ({
  title: route.params?.title ?? route.name,
});
