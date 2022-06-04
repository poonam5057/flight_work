/**
 * @format
 * @flow strict-local
 */

import React, { Node } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import styled from '@emotion/native';

import AuthLayout from './AuthLayout';
import Text from '../../../components/Text';
import ForgotPasswordForm from '../../../components/forms/ForgotPasswordForm';
import { sendSignInLink } from '../../../utils/auth';

const ForgotPassword = ({
  navigation,
}: {
  navigation: NavigationProp,
}): Node => {
  return (
    <AuthLayout>
      <TitleWrap>
        <Title color="dark" size="large" weight={500}>
          Forgot Password
        </Title>
        <Text>Enter your email address to receive your sign-in link.</Text>
      </TitleWrap>

      <ForgotPasswordForm
        navigation={navigation}
        onSubmit={({ email }) => sendSignInLink({ email, actionCodeSettings })}
      />
    </AuthLayout>
  );
};

const TitleWrap = styled.View(({ theme }) => ({
  marginBottom: theme.layout.space(1.5),
  paddingHorizontal: theme.layout.space(1),
}));

const Title = styled(Text)(({ theme }) => ({
  marginBottom: theme.layout.space(1.5),
}));

const actionCodeSettings = {
  handleCodeInApp: true,
  url: window.location.origin,
};

export default ForgotPassword;
