/**
 * @format
 * @flow strict-local
 */

import React, { Node } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import styled from '@emotion/native';

import AuthLayout from './AuthLayout';
import Text from '@appComponents/Text';
import LoginForm from '@appComponents/forms/LoginForm';
import { login } from '@appUtils/auth';

/* TODO: Refactor so LoginForm is not needed or children are passed to the LoginForm
   See https://bitbucket.org/aviatainc/flightworks-combined/pull-requests/41/feat-fw-175-main-trips-screen-for-owners#comment-263307964
*/

const Login = ({ navigation }: { navigation: NavigationProp }): Node => {
  return (
    <AuthLayout>
      <TitleWrap>
        <Text color="dark" size="extraExtraLarge">
          Welcome Back!
        </Text>
        <Text>Please login to your account.</Text>
      </TitleWrap>

      <LoginForm navigation={navigation} onSubmit={login} />
    </AuthLayout>
  );
};

const TitleWrap = styled.View(({ theme }) => ({
  marginBottom: theme.layout.space(2),
  paddingHorizontal: theme.layout.space(1),
}));

export default Login;
