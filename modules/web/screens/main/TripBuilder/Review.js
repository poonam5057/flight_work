/**
 * @format
 * @flow strict-local
 */

import React, { Node } from 'react';
import styled from '@emotion/native';
import TripDetails from '../Trip/TripDetails';

type ReviewProps = {
  trip: Object,
  goToStep: () => void,
};

const Review = ({ trip, goToStep }: ReviewProps): Node => {
  return (
    <ReviewLayout>
      <TripDetails data={trip} onEdit={() => goToStep(0)} />
    </ReviewLayout>
  );
};

const ReviewLayout = styled.View`
  flex: 1;
  flex-direction: column;
  align-items: stretch;
`;

export default Review;
