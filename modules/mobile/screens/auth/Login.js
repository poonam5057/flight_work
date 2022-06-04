/**
 * @format
 * @flow strict-local
 */

import React, { Node } from 'react';
import type { NavigationProp } from '@react-navigation/native';

import LoginForm from '@appComponents/forms/LoginForm';
import AuthLayout from './AuthLayout';
import { login } from '../../../utils/auth';
import MobileView from '../../components/MobileView';

/* TODO: Refactor so LoginForm is not needed or children are passed to the LoginForm
   See https://bitbucket.org/aviatainc/flightworks-combined/pull-requests/41/feat-fw-175-main-trips-screen-for-owners#comment-263307964
*/

const Login = ({ navigation }: { navigation: NavigationProp }): Node => (
  <MobileView>
    <AuthLayout>
      <LoginForm navigation={navigation} onSubmit={login} />
    </AuthLayout>
  </MobileView>
);

export default Login;
