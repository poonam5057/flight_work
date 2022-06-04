/**
 * @file
 * Photo display component
 * Used to preview an image with date/time and remove button
 */

import CloseIcon from '@carbon/icons/svg/32/delete.svg';
import NoImage from '@carbon/icons/svg/32/no-image.svg';
import styled from '@emotion/native';
import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React from 'react';
import { useAsync } from 'react-async-hook';

import { IMAGE_PROP } from '../constants/PropTypes';
import { resolveLocalPhoto } from '../utils/file';
import { LoadingIndicator } from './LoadingIndicators';
import { PrimaryIcon, RegularText, SupportIcon } from './Theme';

export const PhotoDisplay = ({ image, onDelete, readOnly = false }) => {
  const [imageError, setImageError] = React.useState(false);
  const { navigate } = useNavigation();

   const imageTask = useAsync(async () => {
    // For currently added images during form edits
    if (image.uri) return image;

    if (!image.relativePath) throw new Error('Image unavailable');

    const localPath = await resolveLocalPhoto(image.relativePath);
    return { uri: localPath };
  }, [ image ]);

  const hasError = Boolean(imageTask.error || imageError);

  return (
    <PhotoDisplayContainer>
      <PhotoBox aspectRatio={ 1 }>
        <LoadingIndicator visible={ imageTask.loading } />
        { hasError && <SupportIcon Icon={ NoImage } size={ 84 } color="support01" /> }
        {
          Boolean(imageTask.result && !hasError) &&
          <PhotoPreviewButton onPress={() => navigate('Image Preview', { image: imageTask.result, onDelete })}>
            <Photo source={ imageTask.result } onError={() => setImageError(true)} />
          </PhotoPreviewButton>
        }
      </PhotoBox>

      { Boolean(imageTask.error) && <RegularText>{ imageTask.error.message }</RegularText> }
      { Boolean(imageError) && <RegularText>Image unavailable</RegularText> }

      {
        !readOnly && (
          <DeleteButtonContainer>
            <DeletePhotoButton onPress={ onDelete }>
              <PrimaryIcon color="danger" size="iconSize03" Icon={ CloseIcon } />
            </DeletePhotoButton>
          </DeleteButtonContainer>
        )
      }
    </PhotoDisplayContainer>
  );
};

PhotoDisplay.propTypes = {
  image: IMAGE_PROP.isRequired,
  onDelete: PropTypes.func,
  readOny: PropTypes.bool,
};

const PhotoDisplayContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 104px;
`;

const PhotoBox = styled.View`
  height: 100%;
  justify-content: center;
`;

const PhotoPreviewButton = styled.TouchableOpacity`
`;

const Photo = styled.Image`
  width: 100%;
  height: 100%;
`;

const DeleteButtonContainer = styled.View`
  justify-content: center;
  align-items: center;
`;

const DeletePhotoButton = styled.TouchableOpacity`
  margin-right: ${({ theme }) => theme.layout.spacing03};
`;
