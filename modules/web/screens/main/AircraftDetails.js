import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/native';
import { ActivityIndicator } from 'react-native-paper';
import { View } from 'react-native';
import _ from 'lodash';

import {
  Header,
  MainSurface,
  ScreenLayout,
  SectionBody,
  SectionHeader,
  Spacer,
} from '@appComponents/ScreenLayout';
import Text, { PersonText } from '@appComponents/Text';
import Button from '@appComponents/Button';
import { useAircraftDialog } from '@webComponents/AircraftDialog';
import { useAircraftData } from '@appUtils/aircraft';
import Tabs from '@appComponents/Tabs';
import { AircraftSquawks } from '@webComponents/AircraftSquawks';

const AircraftDetails = ({ navigation, route }) => {
  const { documentPath } = route.params;
  const [aircraft, loading] = useAircraftData(documentPath);
  const aircraftId = _.last(_.split(documentPath, '/'));

  const [activeTab, setActiveTab] = useState(
    route.params?.tab ?? AircraftTab.INFO,
  );

  useEffect(() => {
    const params = {
      title: aircraft?.tailNumber,
    };
    navigation.setOptions(params);
  }, [aircraft?.tailNumber, navigation]);

  return (
    <ScreenLayout alignItems="stretch">
      <AircraftDetailsHeader>
        <AircraftTabs activeTab={activeTab} onChange={setActiveTab} />
      </AircraftDetailsHeader>
      {activeTab === AircraftTab.INFO && (
        <AircraftInfo
          aircraft={aircraft}
          loading={loading}
          documentPath={documentPath}
        />
      )}
      {activeTab === AircraftTab.ACTIVE && (
        <AircraftSquawks aircraftId={aircraftId} />
      )}
      {activeTab === AircraftTab.ARCHIVED && (
        <AircraftSquawks aircraftId={aircraftId} archived={true} />
      )}
    </ScreenLayout>
  );
};

const AircraftInfo = ({ aircraft, loading, documentPath }) => {
  const { dialogNode, openDialog } = useAircraftDialog({
    mode: 'Edit',
    documentPath,
  });

  return (
    <>
      <MainSurface>
        <Wrapper>
          <SectionHeader>
            <Text color="dark" weight={500}>
              AIRCRAFT INFO
            </Text>
            <Button
              mode="outlined"
              icon="edit"
              color="dark"
              ml={1}
              onPress={openDialog}
            />
          </SectionHeader>

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <Details aircraft={aircraft} />
          )}
        </Wrapper>
      </MainSurface>
      {dialogNode}
    </>
  );
};

const Details = ({ aircraft }) => {
  const items = useMainInfo(aircraft);

  return (
    <Body>
      <MainGrid>
        <View>
          {items.map(item => (
            <GridItem key={item.label} {...item} />
          ))}
        </View>
        <View>
          <OwnerInformation owners={aircraft.owners} />

          <PilotInformation pilots={aircraft.pilots} />
        </View>
      </MainGrid>
    </Body>
  );
};

const OwnerInformation = ({ owners = [] }) => {
  const ownedBy = _.head(owners);
  const otherOwners = owners.slice(1);

  return (
    <Grid>
      <GridLabel>Owners</GridLabel>
      <GridContent>
        <View>
          {Boolean(ownedBy) && (
            <PrimaryOwner>
              <PersonText entry={ownedBy} />
              <Badge label="Primary Owner" />
            </PrimaryOwner>
          )}

          {otherOwners.map((owner, i) => (
            <React.Fragment key={i}>
              <Spacer />
              <PersonText entry={owner} />
            </React.Fragment>
          ))}
          {_.isEmpty(owners) && <Text>-</Text>}
        </View>
      </GridContent>
    </Grid>
  );
};

const PilotInformation = ({ pilots = [] }) => (
  <Grid>
    <GridLabel>Pilots</GridLabel>
    <GridContent>
      <View>
        {pilots.map((pilot, i) => (
          <React.Fragment key={i}>
            <PersonText entry={pilot} />
            <Spacer />
          </React.Fragment>
        ))}
      </View>
      {_.isEmpty(pilots) && <Text>-</Text>}
    </GridContent>
  </Grid>
);

const GridItem = ({ label, content }) => (
  <Grid>
    <GridLabel>{label}</GridLabel>
    <GridContent>
      <Text size="medium" color="dark">
        {content}
      </Text>
    </GridContent>
  </Grid>
);

const Badge = ({ label = '' }) => (
  <OwnerBadge>
    <Text color="dark">{label}</Text>
  </OwnerBadge>
);

const useMainInfo = aircraft =>
  useMemo(
    () => [
      {
        label: 'Tail #',
        content: aircraft.tailNumber,
      },
      {
        label: 'Aircraft Name',
        content: aircraft.name,
      },
      {
        label: 'Aircraft Type',
        content: aircraft.type,
      },
      {
        label: 'Number Of Engines',
        content: aircraft.numEngines,
      },
      {
        label: 'Last Location',
        content: aircraft.location ?? '-',
      },
      {
        label: 'Current Fuel',
        content: aircraft.fuelOff ? `${aircraft.fuelOff}lbs` : '-',
      },
    ],
    [aircraft],
  );

const Wrapper = styled.ScrollView(({ theme }) => ({
  padding: theme.layout.space(3),
}));

const Body = styled(SectionBody)(({ theme }) => ({
  paddingHorizontal: theme.layout.space(2.5),
}));

const Grid = styled.View(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginTop: theme.layout.space(2),
}));

const MainGrid = styled(Grid)`
  justify-content: space-between;
`;

const PrimaryOwner = styled.View`
  flex-direction: row;
  align-items: center;
`;

const OwnerBadge = styled.View(({ theme }) => ({
  paddingVertical: theme.layout.space(0.25),
  paddingHorizontal: theme.layout.space(0.5),
  marginLeft: theme.layout.space(0.5),
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#fb6107',
}));

const GridLabel = styled(Text)`
  min-width: 170px;
  font-weight: 500;
  line-height: 24px;
`;

const GridContent = styled.View`
  flex-direction: row;
  min-width: 200px;
  min-height: 24px;
  align-items: center;
`;

const AircraftDetailsHeader = styled(Header)`
  padding-bottom: 0;
`;

const AircraftTab = {
  INFO: 'Aircraft Info',
  ACTIVE: 'Active Squawks',
  ARCHIVED: 'Archived Squawks',
  HISTORY: 'Trip History',
};

const getAircraftRoutes = () => [
  { key: 'info', title: AircraftTab.INFO },
  { key: 'active', title: AircraftTab.ACTIVE },
  { key: 'archived', title: AircraftTab.ARCHIVED },
  // { key: 'history', title: AircraftTab.HISTORY },
];

const AircraftTabs = ({ activeTab, onChange }) => {
  const [routes] = useState(getAircraftRoutes);
  const handleChange = useCallback(
    ({ route }) => onChange(route.title),
    [onChange],
  );

  return (
    <Tabs
      tabIndex={routes.findIndex(tab => tab.title === activeTab)}
      onTabPress={handleChange}
      routes={routes}
      tabBarInline
    />
  );
};

export default AircraftDetails;
