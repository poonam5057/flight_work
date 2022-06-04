/**
 * @format
 * @flow strict-local
 */

import React, { Node, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Button from '@appComponents/Button';
import Notification from '@appComponents/Notification';
import {
  EmailFormField,
  FirstNameFormField,
  LastNameFormField,
  PhoneNumberFormField,
} from '@appComponents/forms/FormFields';
import { Spacer } from '@appComponents/ScreenLayout';
import styled from '@emotion/native';
import { useNavigation } from '@react-navigation/native';

const EditPassengerForm = ({
  defaultValues,
  isNew,
  onSubmit,
}: EditPassengerFormProps): Node => {
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const submit = handleSubmit(
    useCallback(
      payload =>
        onSubmit(payload).catch(error => {
          setError('general', { type: 'manual', message: error.message });
        }),
      [onSubmit, setError],
    ),
  );

  useScreenHeader({ navigation, isSubmitting, submit, isNew });

  return (
    <Container>
      <FirstNameFormField control={control} />
      <Spacer size={2} />
      <LastNameFormField control={control} />
      <Spacer size={2} />
      <EmailFormField control={control} optional />
      <Spacer size={2} />
      <PhoneNumberFormField control={control} optional />

      <Notification
        color="error"
        visible={errors?.general}
        onDismiss={() => clearErrors()}>
        {errors?.general?.message}
      </Notification>
    </Container>
  );
};

const Container = styled.View(({ theme }) => ({
  paddingVertical: theme.layout.space(2.5),
  paddingHorizontal: theme.layout.space(2),
  width: '100%',
  height: '100%',
}));

type EditPassengerFormProps = {
  defaultValues: {
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
  },
  isNew: boolean,
  onSubmit: () => void,
};

const useScreenHeader = ({ navigation, isSubmitting, submit, isNew }) => {
  useEffect(() => {
    const params = {
      headerRight: () => (
        <Button loading={isSubmitting} mode="text" onPress={submit}>
          {isNew ? 'Add' : 'Save'}
        </Button>
      ),
    };
    navigation.setOptions(params);
  }, [isSubmitting, navigation, submit, isNew]);
};

export default EditPassengerForm;
