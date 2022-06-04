import React from 'react';
import styled from '@emotion/native';
import _ from 'lodash';
import { DateTime } from 'luxon';

import Button, { LinkButton } from '@appComponents/Button';
import {
  Circle,
  Header,
  MainSurface,
  ScreenLayout,
  ScreenLoader,
} from '@appComponents/ScreenLayout';
import { useAircraftDialog } from '../../components/AircraftDialog';
import { useAircraftList } from '@appUtils/aircraft';
import DataTable, { Cell, PlainCell } from '@appComponents/DataTable';
import Text, { PersonText } from '@appComponents/Text';
import { SquawkLegend } from '../../components/SquawkLegend';

const Aircraft = ({ navigation }) => {
  const { loading, data, error } = useAircraftList();
  const { dialogNode, openDialog } = useAircraftDialog({ mode: 'Add' });

  let emptyMessage = <Text>No Aircraft Available</Text>;

  if (loading && _.isEmpty(data)) {
    emptyMessage = <Text>Loading...</Text>;
  }
  if (error) {
    emptyMessage = <Text>Failed to load aircraft. Try again later</Text>;
  }

  return (
    <ScreenLayout alignItems="stretch">
      <Header>
        <AddAircraftButton color="accent" onPress={openDialog}>
          Add Aircraft
        </AddAircraftButton>
      </Header>

      {dialogNode}

      <MainSurface>
        {loading && <ScreenLoader />}
        <SquawkLegend />
        <DataTable data={data} emptyMessage={emptyMessage}>
          <TailCell title="Tail #" navigation={navigation} />
          <PlainCell title="Name" path="name" />
          <PlainCell title="Type" path="type" />
          <NameCell title="Primary Owner" />
          <PlainCell title="Location" path="location" />
          <LastTripCell title="Last Trip" />
          <PlainCell
            numeric
            title="Fuel Off"
            path="fuelOff"
            suffix="lbs"
            flex={0.5}
          />
        </DataTable>
      </MainSurface>
    </ScreenLayout>
  );
};

const TailCell = ({ item, navigation, ...cellProps }) => {
  const tail = item.tailNumber;
  const labelStyle = { marginHorizontal: 0 };

  return (
    <Cell {...cellProps}>
      <Circle color="#7CB518" size={10} />
      <LinkButton
        toScreen="Aircraft Details"
        params={{ documentPath: item.path }}
        mode="text"
        labelStyle={labelStyle}>
        {tail}
      </LinkButton>
    </Cell>
  );
};

const NameCell = ({ item, flex }) => (
  <Cell flex={flex}>
    <PersonText entry={_.get(item, 'owners.0')} />
  </Cell>
);

const LastTripCell = ({ item, ...cellProps }) => {
  const lastUpdate = item?.dateUpdated;
  if (!lastUpdate) {
    return <Cell {...cellProps}>-</Cell>;
  }

  const date = DateTime.fromSeconds(lastUpdate.seconds).toLocaleString(
    DateTime.DATE_MED,
  );

  return <Cell {...cellProps}>{date}</Cell>;
};

const AddAircraftButton = styled(Button)`
  margin-left: auto;
`;

export default Aircraft;
