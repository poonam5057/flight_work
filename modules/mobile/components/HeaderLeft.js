/**
 * @file
 * This is our custom left side header
 * Providing a back arrow, a left aligned title and an optional subtitle
 *
 * @format
 * @flow strict-local
 */
import React from 'react';

import { useNavigation, NavigationProp } from '@react-navigation/native';
import styled from '@emotion/native';
import { Box } from '@appComponents/ScreenLayout';
import Text from '@appComponents/Text';
import { IconButton as PaperIconButton } from 'react-native-paper';

type HeaderLeftProps = {
  title: string,
  tintColor?: string,
  subTitle?: string,
  navigation: NavigationProp,
};

const HeaderLeft = ({
  tintColor,
  title,
  subTitle,
  navigation,
}: HeaderLeftProps): Node => {
  const nav = useNavigation();

  return (
    <Layout>
      <IconButton
        icon="back-arrow"
        subTitle={subTitle}
        color={tintColor}
        onPress={navigation ? navigation.goBack : nav.goBack}
      />
      <Box>
        <Text size="medium">{title.toUpperCase()}</Text>
        {Boolean(subTitle) && (
          <Text size="small" color="subTitle">
            {subTitle}
          </Text>
        )}
      </Box>
    </Layout>
  );
};

/**
 * Common header left configuration for screen options
 */
export const subScreenOptions = ({ route, ...rest }) => ({
  title: '',
  headerLeft: props => (
    <HeaderLeft
      title={route.params?.title || route.params?.name || route.name}
      subTitle={route.params?.subTitle}
      {...props}
      {...rest}
    />
  ),
});

const Layout = styled.View(({ theme }) => ({
  flexDirection: 'row',
  marginLeft: theme.layout.space(-1),
  height: 44,
  alignItems: 'center',
}));

const IconButton = styled(PaperIconButton)(({ theme }) => ({
  marginHorizontal: 'auto',
}));

export default HeaderLeft;
