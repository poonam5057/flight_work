import * as React from 'react';
import type { Node } from 'react';
import styled from '@emotion/native';

import AuthImage from '../../../../assets/img/login-img@2x.jpg';
import AppLogo from '../../../../assets/logo/app-logo.svg';

const AuthLayout = ({ children }: AuthLayoutProps): Node => (
  <AuthContainer>
    <AuthContent>
      <AppLogo width={216} height={72} />
      <AuthContentInner>{children}</AuthContentInner>
    </AuthContent>

    <BannerWrap>
      <ImageBackground source={{ uri: AuthImage }} />
    </BannerWrap>
  </AuthContainer>
);

type AuthLayoutProps = {
  children: Node,
};

const AuthContainer = styled.View`
  align-items: stretch;
  justify-content: stretch;
  flex: 1;
  flex-direction: row;
`;

const AuthContent = styled.View`
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const AuthContentInner = styled.View(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  marginTop: theme.layout.space(5),
}));

const BannerWrap = styled.View`
  flex: 1;
`;

const ImageBackground = styled.ImageBackground`
  flex: 1;
`;

export default AuthLayout;
