/**
 * @file
 * Our custom Progress Tracker
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import type { Node } from 'react';
import styled from '@emotion/native';
import { ProgressBar as NativeProgressBar } from 'react-native-paper';
import colorConverter from 'color';

import { useTheme } from './theme';
import Text from './Text';

const ProgressTracker = ({
  color,
  steps,
  currentStep,
}: ProgressTrackerProps): Node => {
  const theme = useTheme();
  const progress = currentStep / steps.length;

  return (
    <ProgressTrackerWrap>
      <ProgressBar progress={progress} color={theme.colors[color]} />
      <ProgressTrackerOptions>
        {steps.map((step, i) => (
          <ProgressTrackerOption key={i}>
            <ProgressTrackerIndicator active={i < currentStep} />
            <ProgressTrackerText>{step}</ProgressTrackerText>
          </ProgressTrackerOption>
        ))}
      </ProgressTrackerOptions>
    </ProgressTrackerWrap>
  );
};

type ProgressTrackerProps = {
  /**
   * Color of the progress line
   */
  color?: 'primary' | 'accent' | 'error' | 'notification',
  /**
   * List of progress steps
   */
  steps?: Array<string>,
  /**
   * Current progress step
   */
  currentStep?: number,
};

ProgressTracker.defaultProps = {
  color: 'accent',
  steps: [],
  currentStep: 1,
};

const ProgressTrackerWrap = styled.View`
  min-width: 200px;
`;

const ProgressTrackerOptions = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ProgressTrackerOption = styled.View(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  marginRight: theme.layout.space(0.5),
}));

const ProgressTrackerIndicator = styled.View(({ theme, active }) => ({
  width: 18,
  height: 18,
  borderWidth: 1,
  borderRadius: 18,
  borderColor: active
    ? theme.colors.surface
    : colorConverter(theme.colors.surface).darken(0.14).hex(),
  ...(active && {
    backgroundColor: '#FFC857',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  }),
}));

const ProgressTrackerText = styled(Text)(({ theme }) => ({
  marginLeft: theme.layout.space(0.25),
}));

ProgressTrackerText.defaultProps = { color: 'dark', size: 'smallest' };

const ProgressBar = styled(NativeProgressBar)(({ theme }) => ({
  backgroundColor: '#C4C4C4',
  borderRadius: 100,
  height: 5,
  marginVertical: theme.layout.space(1),
}));

export default ProgressTracker;
