/**
 * @file
 * ImageViewerModal component
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import type { Node } from 'react';
import ImageThumbnails from './ImageThumbnails';
import Dialog from '@appComponents/Dialog';
import styled from '@emotion/native';

export const ImageViewerModal = ({
  images,
  defaultIndex,
  onDismiss,
  visible,
}: ImageViewerModalProps): Node => {
  const [index, setIndex] = React.useState(0);
  const thumbnails = images.map(image => ({ uri: image.thumbnail }));
  const currentImage = images[index]?.original;

  React.useEffect(() => setIndex(defaultIndex), [defaultIndex]);

  return (
    <ModalWrap onDismiss={onDismiss} visible={visible}>
      <OriginalImage source={{ uri: currentImage }} />
      <ImageThumbnails
        currentIndex={index}
        images={thumbnails}
        onPress={setIndex}
        modal={true}
      />
    </ModalWrap>
  );
};

type ImageViewerModalProps = {
  images: Array<{
    thumbnail: string,
    original: string,
  }>,
  defaultIndex: number,
  onDismiss?: () => void,
};

const ModalWrap = styled(Dialog)`
  height: 85%;
`;

const OriginalImage = styled.Image(({ theme }) => ({
  resizeMode: 'contain',
  flex: 1,
  marginBottom: theme.layout.space(0.5),
}));

export default ImageViewerModal;
