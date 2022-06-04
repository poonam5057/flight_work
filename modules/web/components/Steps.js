/**
 * @file
 * Steps component
 *
 * @format
 * @flow strict-local
 */
import React from 'react';
import type { Node } from 'react';
import { Pressable } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Divider } from 'react-native-paper';
import styled from '@emotion/native';
import { Button as PaperButton } from 'react-native-paper';
import Text from '@appComponents/Text';

const Steps = ({
  steps = [],
  onStepPress,
  activeIndex,
  style,
}: StepProps): Node => {
  return (
    <StepsLayout style={style}>
      <StepsLine />
      {steps.map((entry, i) => (
        <Step
          key={entry.name}
          label={entry.name}
          index={i}
          isActive={i === activeIndex}
          isComplete={entry.isComplete}
          hasWarning={entry.hasWarning}
          onPress={() => onStepPress(i, entry)}
        />
      ))}
    </StepsLayout>
  );
};

type StepProps = {
  steps: Array<{ name: string, isComplete: boolean }>,
  onStepPress: ({ name: string }) => void,
  activeIndex?: number,
  style?: ViewStyle,
};

Steps.defaultProps = {};

const Step = ({ index, label, isActive, isComplete, hasWarning, onPress }) => (
  <Pressable onPress={onPress}>
    <StepLayout
      isActive={isActive}
      isComplete={isComplete}
      hasWarning={hasWarning}>
      <Text size="medium" weight="500" color="inherit">
        {index + 1}
      </Text>
      <StepLabel
        onPress={onPress}
        labelStyle={styles.stepLabel}
        isActive={isActive}>
        {label}
      </StepLabel>
    </StepLayout>
  </Pressable>
);

const StepsLayout = styled.View`
  flex-direction: row;
  min-height: 80px;
  justify-content: space-between;
  align-items: center;
`;

const StepsLine = styled(Divider)`
  width: 100%;
  position: absolute;
  z-index: 0;
`;

const StepLayout = styled.View(({ theme, ...props }) => {
  const styles = {
    borderRadius: '50%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: props.isActive ? theme.colors.primary : theme.colors.text,
    width: theme.layout.space(2.25),
    height: theme.layout.space(2.25),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  };

  if (props.isComplete) {
    styles.backgroundColor = theme.colors.primary;
    styles.color = theme.colors.surface;
  }

  if (props.hasWarning) {
    styles.backgroundColor = theme.colors.highlight;
  }

  if (props.isActive) {
    styles.borderColor = theme.colors.primary;
  }

  return styles;
});

const StepLabel = styled(PaperButton)`
  position: absolute;
  min-width: 100px;
  bottom: -36px;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.medium};
`;

const styles = {
  stepLabel: { fontSize: 'inherit', color: 'inherit' },
};

export default Steps;
