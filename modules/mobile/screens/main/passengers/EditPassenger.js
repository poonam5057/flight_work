import React, { useCallback, useMemo } from 'react';
import { ScreenLayout } from '@appComponents/ScreenLayout';
import { useTheme } from '@appComponents/theme';
import EditPassengerForm from '../../../components/forms/EditPassengerForm';
import HeaderLeft from '../../../components/HeaderLeft';
import { editPassenger } from '../../../../utils/passengers';
import { useNavigation } from '@react-navigation/native';

const EditPassenger = ({ route }): Node => {
  const theme = useTheme();
  const { passenger, isNew } = route.params;
  const { firstName, lastName } = usePassengerName(passenger);
  const { goBack } = useNavigation();

  const defaultValues = {
    firstName,
    lastName,
    email: passenger?.email ?? '',
    phone: passenger?.phoneNumber ?? '',
  };

  const onSubmit = useCallback(
    async payload => {
      await editPassenger(passenger, payload);
      goBack();
    },
    [passenger, goBack],
  );

  return (
    <ScreenLayout color={theme.colors.background}>
      <EditPassengerForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        isNew={isNew}
      />
    </ScreenLayout>
  );
};

const usePassengerName = passenger =>
  useMemo(() => {
    if (passenger?.name) {
      const [firstName, ...rest] = passenger.name.split(' ');
      const lastName = rest.join(' ');

      return { firstName, lastName };
    }

    return { firstName: '', lastName: '' };
  }, [passenger]);

type EditPassengerHeaderProps = {
  tintColor: string,
  route: {
    isNew: boolean,
  },
};

export const EditPassengerHeaderLeft = ({
  route,
  tintColor,
  navigation,
}: EditPassengerHeaderProps) => {
  const isNew = route.params?.isNew;

  return (
    <HeaderLeft
      tintColor={tintColor}
      route={route}
      title={`${isNew ? 'Add' : 'Edit'} Passenger`}
      navigation={navigation}
    />
  );
};

export default EditPassenger;
