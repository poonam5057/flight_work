import React, { Node, useCallback, useEffect } from 'react';
import styled from '@emotion/native';
import { Surface } from 'react-native-paper';
import { useForm } from 'react-hook-form';

import { createAccount } from '@appUtils/auth';
import {
  CodeField,
  EmailFormField,
  FirstNameFormField,
  FullNameField,
  LastNameFormField,
  PasswordFormField,
  PhoneNumberFormField,
  RoleFormField,
  UserMessageField,
} from '@appComponents/forms/FormFields';
import { Box, Spacer } from '@appComponents/ScreenLayout';
import Notification from '@appComponents/Notification';
import Button from '@appComponents/Button';
import Checkbox from '@appComponents/Checkbox';
import Text from '@appComponents/Text';
import TextLink from '../../components/TextLink';
import MobileView from '../../components/MobileView';
import AuthLayout from './AuthLayout';
import { useNavigation } from '@react-navigation/native';

const CreateAccount = (): Node => {
  const form = useForm();

  const clearErrors = form.clearErrors;
  const role = form.watch('role');
  useEffect(() => clearErrors(), [clearErrors, role]);

  const signUpCode = form.watch('signUpCode');
  const showCodeField = role && role !== 'neither';
  const showProfile = showCodeField && signUpCode?.length >= 5;

  return (
    <MobileView>
      <AuthLayout>
        <RoleFormField control={form.control} />
        <Spacer size={4} />

        {showCodeField && <CodeField control={form.control} />}

        {showProfile && <ProfileInfo form={form} />}

        {role === 'neither' && <LearnMore form={form} />}
      </AuthLayout>
    </MobileView>
  );
};

const ProfileInfo = ({ form }) => {
  const submit = useCreateAccountCallback(form);
  const { navigate } = useNavigation();
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const error = form.formState.errors.general;

  return (
    <>
      <Spacer size={2} />
      <FirstNameFormField control={form.control} />
      <Spacer size={2} />
      <LastNameFormField control={form.control} />
      <Spacer size={2} />
      <EmailFormField control={form.control} />
      <Spacer size={2} />
      <PhoneNumberFormField control={form.control} />
      <Spacer size={2} />
      <PasswordFormField control={form.control} />
      <Spacer size={2} />
      <Box ml={-2} dir="row" ai="center">
        <Checkbox
          label
          checked={termsAccepted}
          onChange={() => setTermsAccepted(!termsAccepted)}
        />
        <Text>
          <Text>Accept </Text>
          <Text
            color="secondary"
            onPress={() => navigate('Terms And Conditions')}>
            Terms & Conditions
          </Text>
        </Text>
      </Box>

      <Spacer size={2} />
      <SubmitButton
        loading={form.formState.isSubmitting}
        onPress={submit}
        disabled={!termsAccepted}>
        Create Account
      </SubmitButton>

      <Notification
        color="error"
        visible={Boolean(error)}
        onDismiss={form.clearErrors}>
        {error?.message}
      </Notification>
    </>
  );
};

const LearnMore = ({ form }) => {
  // Todo: implement capturing "lear more" requests
  const onSubmit = useCallback(payload => {
    console.log('Lear more - payload: ', payload);
    return Promise.resolve();
  }, []);

  if (form.formState.isSubmitSuccessful) {
    return (
      <ThankYouWrap>
        <Text size="mediumLarge" align="center" lh={20}>
          Thank You!
        </Text>
        <Text align="center" lh={20}>
          Someone will get back to you shortly. In the meantime, please visit
          our website for more information.{' '}
          <TextLink label="flightapp.io!" href="https://flightapp.io" />
        </Text>
      </ThankYouWrap>
    );
  }

  return (
    <>
      <UserMessageField
        mode="contained"
        control={form.control}
        style={{ minHeight: 24 * 5 }}
      />
      <Spacer size={2} />
      <FullNameField control={form.control} />
      <Spacer size={2} />
      <EmailFormField control={form.control} />

      <Spacer size={4} />
      <SubmitButton onPress={form.handleSubmit(onSubmit)}>Submit</SubmitButton>
    </>
  );
};

const useCreateAccountCallback = ({ setError, handleSubmit }) => {
  const submit = useCallback(
    payload =>
      createAccount(payload).catch(error => {
        let errorMessage;
        switch (error.code) {
          case 'auth/weak-password':
            errorMessage = 'Please pick a stronger password.';
            break;
          case 'auth/email-already-in-use':
            errorMessage =
              'That email address is already in use.\nPlease login or enter a different email address.';
            break;
          default:
            errorMessage = error.message;
            break;
        }
        setError('general', { type: 'manual', message: errorMessage });
      }),
    [setError],
  );

  return handleSubmit(submit);
};

const SubmitButton = styled(Button)(({ theme }) => ({
  padding: theme.layout.space(1),
}));

const ThankYouWrap = styled(Surface)(({ theme }) => ({
  padding: theme.layout.space(2),
  backgroundColor: theme.colors.confirmationDialog,
}));

export default CreateAccount;
