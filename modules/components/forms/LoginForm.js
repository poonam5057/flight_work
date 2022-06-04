/**
 * @format
 * @flow strict-local
 */

import React, { Node } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import styled from '@emotion/native';
import { Platform } from 'react-native';

import Button from '../../components/Button';
import Notification from '../../components/Notification';
import Text from '@appComponents/Text';
import { EmailFormField, PasswordFormField } from './FormFields';
import { Spacer } from '../ScreenLayout';
import { getNativeButtonLabelStyle } from '../../mobile/components/styles/labelStyles';

/* TODO: Refactor so LoginForm is not needed or children are passed to the LoginForm
   See https://bitbucket.org/aviatainc/flightworks-combined/pull-requests/41/feat-fw-175-main-trips-screen-for-owners#comment-263307964
*/

const LoginForm = ({ navigation, onSubmit }: LoginFormProps): Node => {
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const submitCallback = React.useCallback(
    payload =>
      onSubmit(payload).catch(error =>
        setError('general', { type: 'manual', message: error.message }),
      ),
    [onSubmit, setError],
  );

  return (
    <>
      <EmailFormField control={control} />
      {Platform.OS !== 'web' && <Spacer />}

      <PasswordFormField control={control} />
      {Platform.OS !== 'web' && <Spacer />}

      <ForgotPassword navigation={navigation} />

      <Login onPress={handleSubmit(submitCallback)} />

      {Platform.OS !== 'web' && (
        <Row>
          <Text color="heading">Don't have an account?</Text>
          <CreateAccountButton
            mode="text"
            color="secondary"
            uppercase={false}
            onPress={() => navigation.push('Create Account')}>
            Sign Up
          </CreateAccountButton>
        </Row>
      )}

      <Row>
        <Notification
          color="error"
          visible={errors?.general}
          onDismiss={() => clearErrors()}>
          {errors?.general?.message}
        </Notification>
      </Row>
    </>
  );
};

type LoginFormProps = {
  navigation: NavigationProp,
  onSubmit: () => void,
};

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Login = ({ onPress }) => {
  if (Platform.OS !== 'web') {
    return (
      <LoginButton onPress={onPress} labelStyle={getNativeButtonLabelStyle()}>
        Login
      </LoginButton>
    );
  } else {
    return <Button onPress={onPress}>Log In</Button>;
  }
};

const ForgotPassword = ({ navigation }) => {
  if (Platform.OS !== 'web') {
    return (
      <NativeForgotPasswordButton
        mode="text"
        color="secondary"
        uppercase={true}
        onPress={() => navigation.push('Forgot Password')}>
        Forgot Password
      </NativeForgotPasswordButton>
    );
  } else {
    return (
      <ForgotPasswordButton
        mode="text"
        uppercase={false}
        onPress={() => navigation.push('Forgot Password')}>
        Forgot Password?
      </ForgotPasswordButton>
    );
  }
};

const NativeForgotPasswordButton = styled(Button)(({ theme }) => ({
  alignSelf: 'flex-start',
  marginBottom: theme.layout.space(0.5),
}));

const ForgotPasswordButton = styled(Button)(({ theme }) => ({
  alignSelf: 'flex-end',
  marginBottom: theme.layout.space(0.5),
}));

const LoginButton = styled(Button)(({ theme }) => ({
  height: 48,
  marginTop: theme.layout.space(3),
  marginBottom: theme.layout.space(2),
}));

const CreateAccountButton = styled(Button)(({ theme }) => ({
  alignSelf: 'flex-start',
  marginBottom: theme.layout.space(0.5),
}));

export default LoginForm;
