import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';
import { useMyData } from '@appUtils/api';
import { ScreenLayout } from '@appComponents/ScreenLayout';
import { useTheme } from '@appComponents/theme';
import PassengersSection from '../../../components/PassengersSection';
import HeaderLeft from '../../../components/HeaderLeft';

const TripPassengers = ({ route }): Node => {
  const theme = useTheme();
  const { passengers, defaultChecked, loading, onSave } = useTripPassengers(
    route.params,
  );

  return (
    <ScreenLayout color={theme.colors.background}>
      {loading && <ActivityIndicator size="large" />}
      {!loading && (
        <PassengerScreen
          passengers={passengers}
          defaultChecked={defaultChecked}
          onSave={onSave}
        />
      )}
    </ScreenLayout>
  );
};

const PassengerScreen = ({ passengers = [], defaultChecked = [], onSave }) => {
  const { navigate } = useNavigation();
  const [allPassengers, setAllPassengers] = useState([]);
  const [checked, setChecked] = useState(defaultChecked);

  const onLeadChange = useCallback(
    (passenger, currentChecked) => {
      setAllPassengers(prevList => changeLead(passenger, prevList));

      if (currentChecked.length > 0) {
        onSave(changeLead(passenger, currentChecked));
      }
    },
    [onSave],
  );

  const onSelect = useCallback(
    list => {
      setChecked(list);
      onSave(list);
    },
    [onSave],
  );

  useEffect(() => {
    setAllPassengers(passengers);

    if (allPassengers.length > 0 && passengers.length > allPassengers.length) {
      onSelect([...checked, passengers[passengers.length - 1]]);
    }
  }, [passengers, onSelect, checked, allPassengers.length]);

  useEffect(() => {
    if (checked.length > 0) {
      return onLeadChange(checked[0], checked);
    }
  }, [checked, onLeadChange]);

  return (
    <PassengersSection
      passengers={allPassengers}
      checked={checked}
      setChecked={onSelect}
      setLeadPassenger={p => onLeadChange(p, checked)}
      onEdit={passenger =>
        navigate('Edit Trip Passenger', { passenger, isNew: !passenger?.name })
      }
    />
  );
};

type TripPassengersHeaderProps = {
  tintColor: string,
  route: {
    customName: string,
    legName: string,
  },
};

export const TripPassengersHeaderLeft = ({
  route,
  tintColor,
}: TripPassengersHeaderProps) => {
  const customName = route.params?.customName;
  const identifier = route.params?.identifier;
  const id = identifier ?? 'New Trip';
  const legName = route?.params?.legName;

  const subTitle = React.useMemo(
    () => [id, customName, legName].filter(Boolean).join(' - '),
    [legName, id, customName],
  );

  return (
    <HeaderLeft
      tintColor={tintColor}
      route={route}
      title="Add Passengers"
      subTitle={subTitle}
    />
  );
};

const useTripPassengers = ({ passengers: defaultChecked, onSave }) => {
  const [user, loading] = useMyData();

  const passengers = useMemo(() => {
    const all = user?.passengers ?? [];

    if (defaultChecked.length > 0) {
      return changeLead(defaultChecked[0], all);
    }

    return all;
  }, [defaultChecked, user?.passengers]);

  return { loading, defaultChecked, passengers, onSave };
};

const changeLead = (lead, all) => [
  lead,
  ...all.filter(p => p.name !== lead.name),
];

export default TripPassengers;
