/**
 * @file
 * Formik Images component
 * Used to list images with add/remove functionality in Formik
 */

import styled from '@emotion/native';
import { useField } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';

import { AddImageButton } from './AddImageButton';
import { ImageList } from './ImagesList';
import {RegularText} from './Theme';

export const FormikImages = ({ fieldName = 'photos', buttonLabel = 'Add Image', limit }) => {
  const [, meta, helpers] = useField(fieldName);
  const { value = [] } = meta;
  const { setValue } = helpers;

  const handleImageResult = (result) => {
    console.info('image result: ', result);
    if (result.cancelled) return;

    const images = value.concat(result);
    setValue(images);
  };

  const deleteImage = (image) => {
    const images = value.filter(i => i !== image);
    setValue(images);
  };

  const isLimitReached = value.length >= limit;

  return (
    <ImagesWrap>
      <AddImageButton label={buttonLabel} onImageResult={handleImageResult} disabled={isLimitReached} />
      { isLimitReached && <TextWrap size="small" color="support03">Image limit reached</TextWrap> }
      <ImageList images={value} onImageDelete={deleteImage} />
    </ImagesWrap>
  );
};

FormikImages.propTypes = {
  fieldName: PropTypes.string,
  buttonLabel: PropTypes.string,
};

const ImagesWrap = styled.View`
  margin-top: ${({ theme }) => theme.layout.spacing03};
`;

const TextWrap = styled(RegularText)`
margin-top: ${({ theme }) => theme.layout.spacing03};
`;
