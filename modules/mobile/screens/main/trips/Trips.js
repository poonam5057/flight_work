import React, { useEffect } from 'react';
import { View } from 'react-native';
import styled from '@emotion/native';
import notifee from '@notifee/react-native';
import _ from 'lodash';
import { Badge } from 'react-native-paper';

import { ScreenLayout } from '@appComponents/ScreenLayout';
import MobileView from '../../../components/MobileView';
import Text, { Title } from '@appComponents/Text';
import Button from '@appComponents/Button';
import { Icon, useTheme } from '@appComponents/theme';
import { Spacer } from '@appComponents/ScreenLayout';
import { TripState, UserRole, TripTab } from '@appUtils/tripConverter';
import { useNavigation } from '@react-navigation/native';
import app from '@appFirebase';
import { useTrips } from './Context';
import { countTrips, useMyData } from '@appUtils/api';

const Trips = ({ navigation }): Node => {
  const theme = useTheme();
  const name = app.auth().currentUser.displayName;
  const [user] = useMyData();
  useBadgeEffect();
  const ownerDraftState = [TripState.OWNER_DRAFT];
  const { trips: draftTrips, loading: draftsLoading } =
    useTrips(ownerDraftState);

  return (
    <MobileView>
      <ScreenLayout color={theme.colors.background}>
        <Spacer size={6} />
        <TripsTitle color="white">Hi {name}</TripsTitle>
        <Spacer size={1} />
        <TripsText color="white">Manage your trips here!</TripsText>
        <Spacer size={12} />
        <Row>
          <TripButton
            states={[]}
            iconName="folder"
            name={TripTab.ARCHIVED}
            onPress={() => navigation.navigate('Archived Trips')}
          />

          <TripButton
            states={[TripState.UPCOMING]}
            iconName="upcoming"
            name={TripTab.UPCOMING}
          />
        </Row>
        <Row>
          <TripButton
            states={[TripState.OWNER_REQUEST, TripState.DRAFT]}
            iconName="requested"
            name={TripTab.REQUESTED}
          />

          <TripButton
            states={[TripState.ENDED, TripState.CANCELLED]}
            iconName="completed"
            name={TripTab.COMPLETED}
          />
        </Row>
        <Row>
          <TripButton
            states={[TripState.ACTIVE]}
            iconName="active"
            name={TripTab.ACTIVE}
          />

          {user?.role !== UserRole.OWNER && <TripButtonPlaceholder />}
          {user?.role === UserRole.OWNER && (
            <TripBuilderButton
              states={[]}
              onPress={() => {
                if (!draftsLoading && draftTrips.length === 0) {
                  navigation.navigate('Trip Builder');
                } else {
                  navigation.navigate('Owner Drafts', {
                    states: ownerDraftState,
                    title: 'Draft Trips',
                  });
                }
              }}
              iconName="circled-plus"
              name="Trip Builder"
              color="#23036A"
              opacity={1}
            />
          )}
        </Row>
      </ScreenLayout>
    </MobileView>
  );
};

const TripButton = ({
  states,
  name,
  onPress,
  iconName,
  color = 'white',
  opacity = 0.7,
  style,
}) => {
  const navigation = useNavigation();
  const count = useCount(states);
  const params = { states, title: `${name} Trips` };
  onPress = onPress || (() => navigation.navigate('List', params));

  return (
    <TripButtonWrap style={style} onPress={onPress}>
      <ButtonView>
        {count > 0 && <FloatingBadge>{count}</FloatingBadge>}
        <Icon
          name={iconName}
          stroke={color}
          fill="none"
          opacity={opacity}
          size={25}
        />
        <Spacer />
        <Text color={color} opacity={opacity} size="medium">
          {name}
        </Text>
      </ButtonView>
    </TripButtonWrap>
  );
};

const useBadgeEffect = () => {
  const count = useCount();
  useEffect(() => {
    notifee.setBadgeCount(count).catch(console.error);
  }, [count]);
};

const useCount = state => {
  const { trips } = useTrips(state);
  const counts = countTrips(trips);

  return counts.unseen + counts.requested;
};

const Row = styled(View)`
  flex-direction: row;
`;

const TripsTitle = styled(Title)`
  align-self: flex-start;
  margin-left: 25px;
`;

const TripsText = styled(Text)`
  align-self: flex-start;
  margin-left: 25px;
`;

const TripButtonPlaceholder = styled(View)(({ theme }) => ({
  margin: 4,
  height: theme.layout.gap(70),
  width: theme.layout.gap(80),
}));

const TripButtonWrap = styled(Button)(({ theme }) => ({
  margin: 4,
  height: theme.layout.gap(70),
  width: theme.layout.gap(80),
  backgroundColor: theme.colors.tripBackground,
  borderColor: theme.colors.tripBorder,
  borderWidth: 1,
}));

const ButtonView = styled(View)(({ theme }) => ({
  alignItems: 'center',
  height: theme.layout.gap(70),
  paddingTop: theme.layout.gap(20),
}));

const TripBuilderButton = styled(TripButton)(({ theme }) => ({
  backgroundColor: theme.colors.secondary,
  borderWidth: 0,
}));

const FloatingBadge = styled(Badge)(() => ({
  position: 'absolute',
  top: '31%',
  left: '60%',
  zIndex: 10,
}));

export default Trips;
