/**
 * @format
 * @flow strict-local
 */

import React, { Fragment, Node } from 'react';
import styled from '@emotion/native';

import Text, { Title } from '@appComponents/Text';
import {
  SectionBody,
  SectionHeader,
  Spacer,
} from '@appComponents/ScreenLayout';
import PassengerList, {
  usePassengerListControl,
} from '../../../components/PassengerList';
import type { PassengerItem } from '../../../components/PassengerEdit';

type PassengerProps = {
  changePassengers: (Leg, Array<PassengerItem>) => void,
  setLeadPassenger: (Leg, PassengerItem) => void,
  legs: Leg[],
  ownerId?: String,
};

type Leg = {
  from: string,
  to: string,
  passengers: Array<PassengerItem>,
};

const Passengers = ({
  changePassengers,
  legs = [],
  setLeadPassenger,
  ownerId,
}: PassengerProps): Node => {
  const { addPassenger, removePassenger, replacePassenger, allPassengers } =
    usePassengerListControl({ legs, changePassengers });

  const shouldRenderLegLists =
    legs.length > 1 && legs.some(leg => leg.passengers.length > 0);

  const legRenderProps = {
    legs,
    addPassenger,
    removePassenger,
    replacePassenger,
    setLeadPassenger,
    ownerId,
  };

  return (
    <PassengersLayout>
      <SectionHeader>
        <Title color="dark" weight={500}>
          ALL
        </Title>
      </SectionHeader>

      <Section>
        <PassengerList
          ownerId={ownerId}
          numColumns={3}
          passengers={allPassengers}
          onAdd={addPassenger}
          onRemove={removePassenger}
          onReplace={replacePassenger}
        />
      </Section>

      {shouldRenderLegLists && legs.length <= 3 && (
        <LegColumns {...legRenderProps} />
      )}

      {shouldRenderLegLists && legs.length > 3 && (
        <LegRows {...legRenderProps} />
      )}
    </PassengersLayout>
  );
};

const LegColumns = ({
  legs,
  addPassenger,
  removePassenger,
  replacePassenger,
  setLeadPassenger,
  ownerId,
}) => (
  <>
    <SectionHeader>
      <Title color="dark" weight={500}>
        PER LEG
      </Title>
    </SectionHeader>

    <Section minHeight={200}>
      {legs.map((leg, legIndex) => (
        <ListWrapper key={getLegLabel(leg, legIndex)}>
          <Text size="medium" color="dark" weight={500}>
            {getLegLabel(leg, legIndex)}
          </Text>
          <Spacer />
          <PassengerList
            ownerId={ownerId}
            passengers={leg.passengers}
            onAdd={passenger => addPassenger(passenger, legIndex)}
            onRemove={passenger => removePassenger(passenger, legIndex)}
            onReplace={replacePassenger}
            setLead={passenger => setLeadPassenger(leg, passenger)}
          />
        </ListWrapper>
      ))}
    </Section>
  </>
);

const LegRows = ({
  legs,
  addPassenger,
  removePassenger,
  updatePassenger,
  setLeadPassenger,
  ownerId,
}) =>
  legs.map((leg, legIndex) => (
    <Fragment key={leg.id}>
      <SectionHeader>
        <Title color="dark" weight={500}>
          {getLegLabel(leg, legIndex)}
        </Title>
      </SectionHeader>

      <Section>
        <PassengerList
          ownerId={ownerId}
          numColumns={3}
          passengers={leg.passengers}
          onAdd={passenger => addPassenger(passenger, legIndex)}
          onRemove={passenger => removePassenger(passenger, legIndex)}
          onReplace={updatePassenger}
          setLead={passenger => setLeadPassenger(leg, passenger)}
        />
      </Section>
    </Fragment>
  ));

const getLegLabel = ({ from, to }: Leg, index) =>
  `${index >= 0 ? `Leg ${index + 1} ` : ''}${from}>${to}`;

const PassengersLayout = styled.View(({ theme }) => ({
  flex: 1,
}));

const Section = styled(SectionBody)(({ theme, minHeight }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  minHeight,
  marginBottom: theme.layout.space(1),
  paddingHorizontal: theme.layout.space(0.5),
}));

const ListWrapper = styled.View(({ theme }) => ({
  paddingTop: theme.layout.space(1),
  paddingRight: theme.layout.space(1),
  maxWidth: '50%',
  minWidth: '33%',
  flex: 1,
}));

export default Passengers;
