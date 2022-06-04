/**
 * @format
 * @flow strict-local
 */

import React, { Node } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import styled from '@emotion/native';

import ForgotPasswordForm from '@appComponents/forms/ForgotPasswordForm';
import AuthLayout from './AuthLayout';
import Text from '../../../components/Text';
import { sendSignInLink } from '../../../utils/auth';
import MobileView from '../../components/MobileView';

const ForgotPassword = ({
  navigation,
}: {
  navigation: NavigationProp,
}): Node => {
  return (
    <MobileView>
      <AuthLayout>
        <TitleWrap>
          <Text size="medium">
            Enter your email address to receive your sign-in link.
          </Text>
        </TitleWrap>
        <ForgotPasswordForm navigation={navigation} onSubmit={sendSignInLink} />
      </AuthLayout>
    </MobileView>
  );
};

const TitleWrap = styled.View(({ theme }) => ({
  marginBottom: theme.layout.space(2),
  alignItems: 'center',
}));

export default ForgotPassword;
