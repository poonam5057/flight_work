/**
 * @format
 * @flow strict-local
 */

import React, { Node } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { Platform } from 'react-native';

import Notification from '../../components/Notification';
import { FormButton, FormButtonsWrap, NativeButton } from './FormButtons';
import { EmailFormField } from './FormFields';
import { useTheme } from '../theme';
import { getNativeButtonLabelStyle } from '../../mobile/components/styles/labelStyles';
import { Spacer } from '../ScreenLayout';

const ForgotPasswordForm = ({ navigation, onSubmit }: FormProps): Node => {
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm();
  const theme = useTheme();

  const [successful, setSuccessful] = React.useState(false);

  const submitCallback = React.useCallback(
    payload =>
      onSubmit(payload)
        .then(() => {
          setSuccessful(true);
          reset();
        })
        .catch(error => setError('general', { type: 'manual', ...error })),
    [onSubmit, reset, setError],
  );

  return (
    <>
      {Platform.OS !== 'web' && <Spacer size={9} />}

      <EmailFormField control={control} />

      {Platform.OS !== 'web' && <Spacer size={9} />}

      {Platform.OS !== 'web' ? (
        <NativeFormButtons
          navigation={navigation}
          theme={theme}
          onPress={handleSubmit(submitCallback)}
        />
      ) : (
        <WebFormButtons
          navigation={navigation}
          onPress={handleSubmit(submitCallback)}
        />
      )}

      <Notification
        color="accent"
        visible={successful}
        onDismiss={() => setSuccessful(false)}>
        If you have an account we have sent an email with a sign-in link to your
        email address.
      </Notification>

      <Notification
        color="error"
        visible={errors?.general}
        onDismiss={() => clearErrors()}>
        {errors?.general?.message}
      </Notification>
    </>
  );
};

type FormProps = {
  navigation: NavigationProp,
  onSubmit: () => void,
};

const WebFormButtons = ({ navigation, onPress }) => (
  <FormButtonsWrap>
    <FormButton color="dark" onPress={() => navigation.goBack()}>
      Cancel
    </FormButton>
    <FormButton onPress={onPress}>Send</FormButton>
  </FormButtonsWrap>
);

const NativeFormButtons = ({ navigation, theme, onPress }) => (
  <FormButtonsWrap>
    <NativeButton
      mode="outlined"
      onPress={() => navigation.goBack()}
      labelStyle={{
        color: theme.colors.primary,
        ...getNativeButtonLabelStyle(),
      }}>
      Cancel
    </NativeButton>
    <FormButton onPress={onPress} labelStyle={getNativeButtonLabelStyle()}>
      Send
    </FormButton>
  </FormButtonsWrap>
);

export default ForgotPasswordForm;
