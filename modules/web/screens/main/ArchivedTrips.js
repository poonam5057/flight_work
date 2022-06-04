import React, { useState } from 'react';

import { MainSurface, ScreenLayout } from '@appComponents/ScreenLayout';
import TripsTable from '../../components/TripsTable';
import { useQuery } from './Trips';

const ArchivedTripsScreen = () => {
  const [sort, setSort] = useState(INITIAL_SORT);
  const { data, loading, error } = useQuery({
    activeTab: 'All',
    sort,
    archived: true,
  });

  return (
    <ScreenLayout alignItems="stretch">
      <MainSurface>
        <TripsTable
          statusCol
          bulkActions
          highlightRequests
          data={data}
          loading={loading}
          error={error}
          initialSort={sort}
          onSortChange={setSort}
        />
      </MainSurface>
    </ScreenLayout>
  );
};

const INITIAL_SORT = { dir: 'desc', title: 'Departure' };

export default ArchivedTripsScreen;
