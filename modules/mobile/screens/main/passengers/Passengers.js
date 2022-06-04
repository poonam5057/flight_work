import React, { useEffect, useState } from 'react';
import { ScreenLayout } from '@appComponents/ScreenLayout';
import { useTheme } from '@appComponents/theme';
import { useMyData } from '../../../../utils/api';
import PassengersSection from '../../../components/PassengersSection';
import { useNavigation } from '@react-navigation/native';
import { removePassenger } from '../../../../utils/passengers';
import { ActivityIndicator } from 'react-native-paper';

const Passengers = (): Node => {
  const theme = useTheme();
  const { navigate } = useNavigation();
  const [user, loading] = useMyData();
  const [passengers, setPassengers] = useState();

  useEffect(() => setPassengers(user?.passengers ?? []), [user?.passengers]);

  return (
    <ScreenLayout color={theme.colors.background}>
      {loading && <ActivityIndicator size="large" />}
      {!loading && (
        <PassengersSection
          passengers={passengers}
          onEdit={passenger =>
            navigate('Edit Passenger', { passenger, isNew: !passenger?.name })
          }
          onRemove={passenger => removePassenger(passenger)}
          hasActions
        />
      )}
    </ScreenLayout>
  );
};

export default Passengers;
