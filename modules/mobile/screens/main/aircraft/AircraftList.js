/**
 * @file
 * User aircraft tab/screen
 *
 * @format
 * @flow strict-local
 */
import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import {
  ActivityIndicator,
  Surface,
  TouchableRipple,
} from 'react-native-paper';
import _ from 'lodash';
import styled from '@emotion/native';
import { useNavigation } from '@react-navigation/native';

import { getUid } from '@appFirebase';
import { Box, ScreenLayout } from '@appComponents/ScreenLayout';
import Text from '@appComponents/Text';
import { useUserAircraft } from '@appUtils/aircraft';
import { useMyData } from '@appUtils/api';
import Button from '@appComponents/Button';
import { Row } from './components';

const AircraftList = ({ navigation }): Node => {
  const { data: list, loading } = useMyAircraftList();

  return (
    <ScreenLayout>
      {loading && <ActivityIndicator size="large" />}
      {!loading && _.isEmpty(list) && (
        <Text size="medium" weight="700" align="center">
          You currently don't have any aircraft assigned to you. Speak with your
          management company to get them added.
        </Text>
      )}
      {!loading && _.size(list) > 0 && (
        <Box flex={1} mt={1}>
          <FlatList
            data={list}
            renderItem={({ item: aircraft }) => (
              <AircraftCard key={aircraft.path} aircraft={aircraft} />
            )}
          />
        </Box>
      )}
      {/* TODO: FW-409 - remove this Box containing Squawk related buttons */}
      <Box dir="row">
        <Button
          onPress={() =>
            navigation.navigate('Squawk', {
              sampleAircraft: _.first(list),
              action: 'VIEW',
            })
          }>
          View Squawk
        </Button>
        <Button
          onPress={() =>
            navigation.navigate('Squawk', {
              sampleAircraft: _.first(list),
              action: 'ADD',
            })
          }>
          Add Squawk
        </Button>
      </Box>
    </ScreenLayout>
  );
};

const AircraftCard = ({ aircraft }) => {
  const navigation = useNavigation();

  const openDetails = useCallback(
    () =>
      navigation.navigate('Aircraft Details', { documentPath: aircraft.path }),
    [aircraft.path, navigation],
  );

  return (
    <TouchableRipple onPress={openDetails}>
      <PaddedCard>
        <Row label="Tail Number" value={aircraft.tailNumber} />
        <Row label="Aircraft Name" value={aircraft.name} />
        <Row label="Aircraft Type" value={aircraft.type} />
      </PaddedCard>
    </TouchableRipple>
  );
};

const useMyAircraftList = () => {
  const [user] = useMyData();
  return useUserAircraft({ id: getUid(), role: user?.role });
};

const PaddedCard = styled(Surface)(({ theme }) => ({
  paddingHorizontal: theme.layout.space(4),
  paddingVertical: theme.layout.space(2),
  marginHorizontal: theme.layout.space(1),
  marginVertical: theme.layout.space(1),
  backgroundColor: theme.colors.tripCardBackground,
}));

export default AircraftList;
