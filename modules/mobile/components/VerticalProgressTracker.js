/**
 * @file
 * Our Vertical Progress Tracker
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import type { Node } from 'react';
import styled from '@emotion/native';
import _ from 'lodash';
import color from 'color';
import { Box } from '@appComponents/ScreenLayout';
import Text from '@appComponents/Text';
import Icon from '@appComponents/theme/Icon';

const VerticalProgressTracker = ({
  legs = [],
  currentIndex = 0,
  finished = false,
}: ProgressTrackerProps): Node => {
  const steps = getProgressSteps(legs);

  return (
    <ProgressTrackerWrap>
      <ProgressLine
        steps={steps}
        currentIndex={currentIndex}
        finished={finished}
      />
      <ProgressLabels steps={steps} />
    </ProgressTrackerWrap>
  );
};

type ProgressTrackerProps = {
  /**
   * List of legs (converted to progress steps)
   */
  legs?: Array<string>,
  /**
   * Current progress step (current location)
   */
  currentIndex?: number,
};

const ProgressLabels = ({ steps = [] }) => {
  const firstStep = steps[0];
  const lastStep = steps[steps.length - 1];

  return (
    <Box height="100%" jc="space-between">
      <Box>
        <Text size="smallest">FROM</Text>
        <Text size="medium" weight="bold">
          {firstStep}
        </Text>
      </Box>
      <Box>
        <Text size="smallest">TO</Text>
        <Text size="medium" weight="bold">
          {lastStep}
        </Text>
      </Box>
    </Box>
  );
};

const ProgressLine = ({ steps = [], currentIndex = 0, finished = false }) => (
  <ProgressLineWrap height={finished ? 106 : 94}>
    {steps.map((s, i) => (
      <ProgressStep
        key={i}
        main={i === 0 || i === steps.length - 1}
        active={i === currentIndex}
        finished={finished}
      />
    ))}
    <Line top={finished ? 18 : 12} />
  </ProgressLineWrap>
);

const ProgressStep = ({ main = false, active = false, finished = false }) => {
  if (finished) {
    if (main) {
      return <Icon name="circle-check" color="transparent" />;
    }

    return <FinishedDot />;
  }

  return <ProgressDot size={main ? 2 : 1} active={active} />;
};

const getProgressSteps = legs => [
  _.head(legs)?.from ?? '-',
  ...(legs.length > 0 ? legs.map(leg => leg?.to ?? '-') : '-'),
];

const ProgressTrackerWrap = styled.View`
  height: 115px;
  flex-direction: row;
  align-items: center;
`;

const ProgressLineWrap = styled.View(({ theme, height }) => ({
  position: 'relative',
  width: 12,
  height,
  marginRight: theme.layout.space(1),
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const Line = styled.View`
  position: absolute;
  top: ${({ top = 12 }) => top}px;
  left: 5.6px;
  width: 0.8px;
  height: 70px;
  background: #ffffff;
  opacity: 0.6;
  z-index: 0;
`;

const ProgressDot = styled.View(({ theme, size = 1, active = false }) => ({
  width: size * 4,
  height: size * 4,
  backgroundColor: active ? theme.colors.legLabel : '#ffffff',
  borderRadius: size * 4,
  zIndex: 1,
  borderWidth: 2,
  borderColor: active
    ? color(theme.colors.legLabel).fade(0.8).toString()
    : 'transparent',
}));

const FinishedDot = styled(ProgressDot)(({ theme }) => ({
  backgroundColor: theme.colors.primary,
}));

export default VerticalProgressTracker;
