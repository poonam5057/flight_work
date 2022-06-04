/**
 * @file
 * Avatar
 *
 * @format
 * @flow strict-local
 */
import React from 'react';
import type { Node } from 'react';
import styled from '@emotion/native';
import { Avatar as NativeAvatar } from 'react-native-paper';
import { Image } from 'react-native';

const Avatar = ({
  firstName = '-',
  lastName = '-',
  size = 32,
  image = undefined,
}: AvatarProps): Node => {
  if (!image) {
    return (
      <AvatarText
        size={size}
        color="#ffffff"
        label={`${getFirstLetter(firstName)}${getFirstLetter(lastName)}`}
      />
    );
  }

  return (
    <AvatarImage
      size={size}
      source={({ size: s }) => (
        <Image
          source={{
            uri: image,
            width: s,
            height: s,
          }}
          style={{ borderRadius: size / 2 }}
        />
      )}
    />
  );
};

type AvatarProps = {
  firstName: string,
  lastName: string,
  size?: number,
  image?: string,
};

const AvatarText = styled(NativeAvatar.Text)`
  background: #3700b3;
`;

const AvatarImage = styled(NativeAvatar.Image)(() => ({
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 0,
  },
  shadowOpacity: 0.3,
  shadowRadius: 2,
  elevation: 4,
}));

const getFirstLetter = text => text.charAt(0).toUpperCase();

export default Avatar;
