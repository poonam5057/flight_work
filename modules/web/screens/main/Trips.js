import React, { useCallback, useState } from 'react';
import styled from '@emotion/native';

import Button from '@appComponents/Button';
import { Header, MainSurface, ScreenLayout } from '@appComponents/ScreenLayout';
import Tabs from '@appComponents/Tabs';
import { useCreateDraftCallback, useTripList } from '@appUtils/api';
import TripsTable from '../../components/TripsTable';
import { TripState, TripTab } from '@appUtils/tripConverter';

const TripsScreen = ({ navigation, route }) => {
  const buildTrip = useCreateDraftCallback();
  const [activeTab, setActiveTab] = useState(
    route.params?.tab ?? TripTab.REQUESTED,
  );

  const [sort, setSort] = useState(INITIAL_SORT);
  const { data, loading, error } = useQuery({ activeTab, sort });

  return (
    <ScreenLayout alignItems="stretch">
      <TripsHeader>
        <TripTabs activeTab={activeTab} onChange={setActiveTab} />

        <BuildButton
          href="/Trip Builder"
          color="accent"
          loading={buildTrip.loading}
          onPress={async e => {
            e.preventDefault();
            navigation.navigate('Trip Builder');
          }}>
          Build Trip
        </BuildButton>
      </TripsHeader>

      <MainSurface>
        <TripsTable
          key={activeTab}
          data={data}
          loading={loading}
          error={error}
          initialSort={sort}
          onSortChange={setSort}
          bulkActions={activeTab !== 'All'}
          statusCol={['Completed', 'All'].includes(activeTab)}
          highlightRequests={activeTab === 'All'}
        />
      </MainSurface>
    </ScreenLayout>
  );
};

const TripTabs = ({ activeTab, onChange }) => {
  const [routes] = useState(getTripsRoutes);
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

const getTripsRoutes = () => [
  { key: 'requested', title: TripTab.REQUESTED },
  { key: 'draft', title: TripTab.DRAFT },
  { key: 'upcoming', title: TripTab.UPCOMING },
  { key: 'active', title: TripTab.ACTIVE },
  { key: 'completed', title: TripTab.COMPLETED },
  { key: 'all', title: TripTab.ALL },
];

export const useQuery = ({ activeTab, sort, archived = false }) => {
  const query = useCallback(
    ref => {
      let qb = ref.collection('trips').where('archived', '==', archived);
      const sortField = getSortField(sort.title);

      switch (activeTab) {
        case TripTab.ALL:
          qb = qb.where('state', 'in', [
            TripState.OWNER_REQUEST,
            TripState.DRAFT,
            TripState.UPCOMING,
            TripState.ACTIVE,
            TripState.ENDED,
            TripState.CANCELLED,
          ]);
          break;
        case TripTab.REQUESTED:
          qb = qb.where('state', '==', TripState.OWNER_REQUEST);
          break;
        case TripTab.DRAFT:
          qb = qb.where('state', '==', TripState.DRAFT);
          break;
        case TripTab.UPCOMING:
          qb = qb.where('state', '==', TripState.UPCOMING);
          break;
        case TripTab.ACTIVE:
          qb = qb.where('state', '==', TripState.ACTIVE);
          break;
        case TripTab.COMPLETED:
          qb = qb.where('state', 'in', [TripState.ENDED, TripState.CANCELLED]);
          break;

        default:
          if (__DEV__) {
            throw new Error(`Unexpected tab name: "${activeTab}"`);
          }
          break;
      }

      // No point in ordering by state, when we're only showing one state (tab)
      if (sortField === '_state' && activeTab !== TripTab.ALL) {
        return qb;
      }

      return qb.orderBy(sortField, sort.dir);
    },
    [activeTab, archived, sort.dir, sort.title],
  );

  return useTripList(query);
};

const getSortField = sortKey => {
  switch (sortKey) {
    case 'State':
      return '_state';
    case 'ID':
      return 'identifier';
    case 'Name':
      return 'customName';
    case 'Tail #':
      return 'aircraft.tailNumber';
    case 'Legs':
      return 'departingFrom';
    case 'Departure':
      return 'dateDeparting';
    case 'Pilot Status':
      return '_pilotState';
    case 'Owner Status':
      return '_ownerState';
    default:
      return 'dateDeparting';
  }
};

const INITIAL_SORT = { dir: 'desc', title: 'Departure' };

const TripsHeader = styled(Header)(() => ({
  paddingBottom: 0,
}));

const BuildButton = styled(Button)`
  text-decoration: none;
`;

export default TripsScreen;
