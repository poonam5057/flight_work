/**
 * @file
 * ImageViewer component
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import type { Node } from 'react';
import ImageThumbnails from './ImageThumbnails';
import ImageViewerModal from './ImageViewerModal';

export const ImageViewer = ({
  images,
  initialIndex,
}: ImageViewerProps): Node => {
  const [index, setIndex] = React.useState(initialIndex);
  const [modalVisible, setModalVisible] = React.useState(false);
  const thumbnails = images.map(image => ({ uri: image.thumbnail }));

  const onThumbnailPress = React.useCallback(thumbIndex => {
    setModalVisible(true);
    setIndex(thumbIndex);
  }, []);

  const onDismiss = React.useCallback(() => {
    setModalVisible(false);
    setIndex(initialIndex);
  }, [initialIndex]);

  return (
    <>
      <ImageThumbnails images={thumbnails} onPress={onThumbnailPress} />
      <ImageViewerModal
        images={images}
        defaultIndex={index}
        onDismiss={onDismiss}
        visible={modalVisible}
      />
    </>
  );
};

type ImageViewerProps = {
  images: Array<{
    thumbnail: string,
    original: string,
  }>,
  initialIndex?: number,
};

ImageViewer.defaultProps = {
  initialIndex: undefined,
};

export default ImageViewer;
