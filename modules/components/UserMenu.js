/**
 * @file
 * User avatar and menu
 *
 * @format
 * @flow strict-local
 */
import React from 'react';
import type { Node } from 'react';
import styled from '@emotion/native';
import { useNavigation } from '@react-navigation/native';

import { Icon } from './theme';
import Text from './Text';
import Avatar from './Avatar';

const UserMenu = ({ user }: UserMenuProps): Node => {
  const { navigate } = useNavigation();

  return (
    <Container onPress={() => navigate('Settings')}>
      <NameContainer>
        <Text size="small" weight={300}>
          {user.firstName} <Text weight={900}>{user.lastName}</Text>
        </Text>
        <Text size="small" weight={300}>
          Company Identifier:{' '}
          <Text weight={900}>{user.managementCompany?.identifier}</Text>
        </Text>
      </NameContainer>

      <AvatarContainer>
        <Avatar {...user} />
      </AvatarContainer>

      {/*<MenuButton>*/}
      {/*  <MenuIcon name="more-dots" size={18} color="#ffffff" />*/}
      {/*</MenuButton>*/}
    </Container>
  );
};

type UserMenuProps = {
  user: {
    firstName: string,
    lastName: string,
    image?: string,
  },
};

const Container = styled.Pressable(() => ({
  flexDirection: 'row',
  alignItems: 'center',
}));

const AvatarContainer = styled.View(({ theme }) => ({
  marginLeft: theme.layout.gap(3),
}));

const NameContainer = styled.View(() => ({
  alignItems: 'flex-end',
}));

const MenuButton = styled.View(({ theme }) => ({
  backgroundColor: theme.colors.surface,
  marginLeft: theme.layout.gap(1),
  width: 14,
  height: 32,
  borderRadius: 7,
  alignItems: 'center',
  justifyContent: 'center',
}));

const MenuIcon = styled(Icon)`
  transform: rotate(-90deg);
`;

export default UserMenu;
