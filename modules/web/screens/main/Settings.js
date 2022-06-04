import React, { cloneElement, useCallback } from 'react';
import styled from '@emotion/native';
import { useForm } from 'react-hook-form';
import { ActivityIndicator } from 'react-native-paper';

import {
  MainSurface,
  ScreenLayout,
  SectionHeader,
} from '@appComponents/ScreenLayout';
import {
  EmailFormField,
  FirstNameFormField,
  LastNameFormField,
  PasswordFormField,
  PhoneNumberFormField,
} from '@appComponents/forms/FormFields';
import Notification from '@appComponents/Notification';
import Text from '@appComponents/Text';
import Button from '@appComponents/Button';
import Avatar from '@appComponents/Avatar';

import { useMyData } from '@appUtils/api';
import { updateAccount, updateUser } from '@appUtils/auth';
import * as Phone from '@appUtils/phone';
import { useAuthState } from '@appFirebase';

const Settings = () => {
  const [auth, authLoading] = useAuthState();
  const [user, userLoading] = useMyData();

  const loading = authLoading || userLoading;

  return (
    <ScreenLayout alignItems="stretch">
      <SettingsSurface>
        {loading && <ActivityIndicator size="large" />}
        {!loading && <SettingsForm {...user} email={auth?.email} />}
      </SettingsSurface>
    </ScreenLayout>
  );
};

const SettingsForm = ({ firstName, lastName, phoneNumber, email }) => {
  const onAccountSubmit = useCallback(async payload => {
    await updateAccount(payload);
  }, []);

  return (
    <SettingsFormContainer>
      <Avatar firstName={firstName} lastName={lastName} size={103} />
      <FormGrid>
        <GenericForm
          title="ACCOUNT SETTINGS"
          defaultValues={{ email, password: '', currentPassword: '' }}
          onSubmit={onAccountSubmit}
          saveFields={['email', 'password']}>
          <EmailFormField />
          <PasswordFormField name="currentPassword" label="Current Password" />
          <PasswordFormField optional />
        </GenericForm>

        <GenericForm
          title="PERSONAL SETTINGS"
          defaultValues={{
            firstName,
            lastName,
            phone: Phone.parse(phoneNumber).formatNational(),
          }}
          onSubmit={updateUser}
          saveFields={['firstName', 'lastName', 'phone']}>
          <FirstNameFormField />
          <LastNameFormField />
          <PhoneNumberFormField />
        </GenericForm>
      </FormGrid>
    </SettingsFormContainer>
  );
};

const GenericForm = ({
  title = '',
  defaultValues = {},
  onSubmit,
  saveFields = [],
  children,
}) => {
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    getValues,
    formState: { errors, isSubmitting, isSubmitSuccessful, dirtyFields },
  } = useForm({ defaultValues });

  const submitCallback = useCallback(
    payload =>
      onSubmit(payload, setError).catch(error =>
        setError('general', { type: 'manual', ...error }),
      ),
    [onSubmit, setError],
  );

  return (
    <FormWrap>
      <SectionHeader>
        <Text color="dark" weight={500}>
          {title}
        </Text>
      </SectionHeader>
      <FormBody>
        {React.Children.map(children, child => {
          return cloneElement(child, { control });
        })}
      </FormBody>
      {saveFields.some(field => dirtyFields[field]) && (
        <FormFooter>
          <Button onPress={() => reset()} color="disabled">
            Cancel
          </Button>
          <Button onPress={handleSubmit(submitCallback)} loading={isSubmitting}>
            Confirm
          </Button>
        </FormFooter>
      )}

      <Notification
        color="accent"
        visible={isSubmitSuccessful}
        onDismiss={() => reset(getValues())}>
        The {title.toLowerCase()} are successfully updated!
      </Notification>

      <Notification
        color="error"
        visible={errors?.general}
        onDismiss={() => clearErrors()}>
        {errors?.general?.message}
      </Notification>
    </FormWrap>
  );
};

const SettingsSurface = styled(MainSurface)`
  justify-content: center;
`;

const SettingsFormContainer = styled.View`
  flex: 1;
  align-items: center;
  margin-top: ${({ theme }) => `${theme.layout.space(4)}px`};
`;

const FormWrap = styled.SafeAreaView`
  width: 100%;
  max-width: 400px;
  margin: ${({ theme }) =>
    `${theme.layout.space(3.25)}px ${theme.layout.space(1.5)}px 0`};
`;

const FormGrid = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
`;

const FormBody = styled.View`
  padding-top: ${({ theme }) => `${theme.layout.space(1)}px`};
`;

const FormFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: auto;
  padding-top: ${({ theme }) => `${theme.layout.space(1)}px`};
`;

export default Settings;
