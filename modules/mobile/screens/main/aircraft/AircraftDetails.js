/**
 * @file
 * Aircraft details screen
 *
 * @format
 * @flow strict-local
 */
import React, { useCallback } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import styled from '@emotion/native';
import _ from 'lodash';
import type { Route, NavigationProp } from '@react-navigation/native';

import { Box, ScreenLayout } from '@appComponents/ScreenLayout';
import { useAircraftData } from '@appUtils/aircraft';
import { Row } from './components';
import Button from '@appComponents/Button';
import Text, { PersonText } from '@appComponents/Text';
import { useMyData } from '@appUtils/api';
import { useAircraftSquawkList } from '@appUtils/squawks';

type DetailProps = {
  route: Route,
  navigation: NavigationProp,
};

const AircraftDetails = ({ route, navigation }: DetailProps): Node => {
  const documentPath = route.params.documentPath;
  const aircraftId = _.last(_.split(documentPath, '/'));
  const { data: squawks } = useAircraftSquawkList(aircraftId);
  const [craft, loading] = useAircraftData(documentPath);
  const [user] = useMyData();
  const manager = user?.managementCompany?.name || 'Your Management Company';

  const openSquawks = useCallback(
    // TODO: FW-409 - Navigate to the squawks list screen instead of the squawk details screen
    () =>
      navigation.navigate('Squawk', {
        sampleAircraft: { ...craft, path: documentPath },
        action: 'ADD',
      }),
    [craft, documentPath, navigation],
  );

  if (!craft && loading) {
    return (
      <ScreenLayout>
        <ActivityIndicator size="large" />
      </ScreenLayout>
    );
  }

  return (
    <Layout>
      <ScrollWrap>
        {/* TODO: FW-409 - Remove this Box and related fields */}
        <Box>
          <Text>Squawks:</Text>
          {_.size(squawks) > 0 ? (
            squawks.map((squawk, i) => (
              <Text>
                {i + 1}: {squawk.title}
              </Text>
            ))
          ) : (
            <Text>No squawks</Text>
          )}
        </Box>
        <DetailsRow label="AIRCRAFT NAME" value={craft.name} />
        <DetailsRow label="AIRCRAFT TYPE" value={craft.type} />
        <DetailsRow label="TAIL NUMBER" value={craft.tailNumber} />
        <DetailsRow label="LAST LOCATION" value={craft.location} />
        <DetailsRow label="LAST TRIP" value="-" />
        <DetailsRow label="CURRENT FUEL" value={craft.fuel} />
        <DetailsRow label="NUMBER OF ENGINES" value={craft.numEngines} />
        <DetailsRow label="METERING TYPE" value="-" />
        <DetailsRow label="APU" value="-" />
        <ListRow label="ASSIGNED PILOTS" list={craft.pilots} />
        <DetailsRow label="PRIMARY OWNER">
          <Person entry={_.head(craft.owners)} />
        </DetailsRow>
        <ListRow label="OTHER OWNERS" list={_.slice(craft.owners, 1)} />
        <DetailsRow label="MANAGEMENT COMPANY" value={manager} />
      </ScrollWrap>

      <SquawksButton onPress={openSquawks}>Active Squawks</SquawksButton>
    </Layout>
  );
};

const ListRow = ({ label, list }) => {
  return (
    <DetailsRow label={label}>
      {list.map((p, i) => (
        <Box key={p.id} mb={i === _.size(list) - 1 ? 0 : 2}>
          <Person entry={p} />
        </Box>
      ))}
      {_.isEmpty(list) && <Text>-</Text>}
    </DetailsRow>
  );
};

const Layout = styled.View(({ theme }) => ({
  flex: 1,
  paddingBottom: theme.layout.gap(2),
}));

const ScrollWrap = styled.ScrollView(({ theme }) => ({
  padding: theme.layout.space(2),
}));

const DetailsRow = styled(Row)(({ theme, mb = 3 }) => ({
  minHeight: theme.layout.space(3),
  marginBottom: theme.layout.space(mb),
}));

const SquawksButton = styled(Button)(({ theme }) => ({
  padding: theme.layout.space(1),
  marginHorizontal: theme.layout.space(2),
  marginTop: theme.layout.gap(2),
}));

const Person = PersonText.bind();
Person.defaultProps = {
  size: 'small',
  color: 'text',
};

export default AircraftDetails;
