/**
 * @file
 * Component listing trip tiles
 *
 * @format
 * @flow strict-local
 */
import React, { useCallback } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import styled from '@emotion/native';
import { Spacer } from '@appComponents/ScreenLayout';
import Text from '@appComponents/Text';
import type { Trip } from '@appUtils/tripConverter';
import TripCard from './TripCard';
import { useNavigation } from '@react-navigation/native';

type TripListProps = {
  trips: Trip[],
  loading: boolean,
  title: string,
  showMessagesButton?: boolean,
};

const TripsList = ({
  trips,
  loading,
  title,
  showMessagesButton,
}: TripListProps): Node => {
  const renderItem = useCallback(
    ({ item }) => (
      <TripCard trip={item} showMessagesButton={showMessagesButton} />
    ),
    [showMessagesButton],
  );

  return (
    <ListLayout
      data={trips}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={listContainerStyle}
      ListEmptyComponent={
        <EmptyWrap>
          {loading && <ActivityIndicator size="large" />}
          {!loading && <EmptyTripsDisplay screenName={title} />}
        </EmptyWrap>
      }
    />
  );
};

const keyExtractor = item => item.path || item.identifier;

const Separator = () => <Spacer dir="vertical" size={2} />;

const listContainerStyle = {
  alignItems: 'center',
  justifyContent: 'center',
};

const ListLayout: FlatList = styled.FlatList(({ theme }) => ({
  flex: 1,
  paddingTop: theme.layout.space(2),
}));

const EmptyWrap = styled.View`
  margin-top: ${({ theme }) => (theme.layout.height / 3).toString()}px;
`;

const EmptyTripsDisplay = ({ screenName }) => {
  const navigation = useNavigation()
  return (
      <Text size="medium" weight="700">
        You don't have any {screenName}.
      </Text>
  );
};

export default TripsList;
