/**
 * @file
 * ImageThumbnails component
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import type { Node } from 'react';
import styled from '@emotion/native';
import { Platform } from 'react-native';

export const ImageThumbnails = ({
  currentIndex,
  images,
  onPress,
  modal,
}: ImageThumbnailsProps): Node => (
  <ImageListWrap modal={modal}>
    {images.map(({ uri }, index) => (
      <ImageButton
        key={`${uri}_${index}`}
        activeOpacity={0.8}
        last={index === images.length - 1}
        onPress={() => onPress(index)}>
        <ImageThumbnail
          active={index === currentIndex}
          source={{ uri }}
          modal={modal}
        />
      </ImageButton>
    ))}
  </ImageListWrap>
);

type ImageThumbnailsProps = {
  images: Array<{
    uri: string,
  }>,
  currentIndex?: number,
  onPress?: () => void,
};

const ImageListWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  ${Platform.OS !== 'web' && 'justify-content: space-between'};
`;

const ImageButton = styled.TouchableOpacity(({ theme, last }) => ({
  marginTop: theme.layout.space(1),
  marginRight: Platform.OS === 'web' && !last ? theme.layout.space(1.5) : 0,
}));

const ImageThumbnail = styled.Image(({ theme, active, modal }) => ({
  height:
    Platform.OS === 'web'
      ? theme.layout.verticalSpace(12)
      : theme.layout.verticalSpace(modal ? 6.5 : 7.2),
  aspectRatio: 1,
  ...(active && {
    borderColor: theme.colors.primary,
    borderWidth: 3,
  }),
}));

export default ImageThumbnails;
