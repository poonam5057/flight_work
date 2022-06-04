/**
 * @file
 * Hande website links in mobile app texts
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { Linking, Pressable } from 'react-native';
import styled from '@emotion/native';

import Text from '@appComponents/Text';

type LinkProps = {
  href: string,
  label: string | Node,
};

const TextLink = ({ href, label }: LinkProps) => (
  <Pressable onPress={() => Linking.openURL(href)}>
    {({ pressed }) => <LinkText pressed={pressed}>{label}</LinkText>}
  </Pressable>
);

const LinkText: typeof Text = styled(Text)(({ theme, pressed }) => ({
  textDecorationLine: 'underline',
  color: pressed ? theme.colors.primary : theme.colors.text,
}));

export default TextLink;
