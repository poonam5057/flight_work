import * as React from 'react';
import type { Node } from 'react';
import styled from '@emotion/native';

const AuthLayout = ({ children }: AuthLayoutProps): Node => (
  <AuthContent>{children}</AuthContent>
);

type AuthLayoutProps = {
  children: Node,
};

const AuthContent = styled.View(({ theme }) => ({
  flex: 1,
  paddingHorizontal: theme.layout.space(2),
  paddingVertical: theme.layout.space(3),
}));

export default AuthLayout;
