/**
 * @file
 * Squawk Legened component
 *
 * @format
 * @flow strict-local
 */

import React, { useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';
import _ from 'lodash';
import styled from '@emotion/native';
import Button from '@appComponents/Button';
import Text from '@appComponents/Text';
import { Box } from '@appComponents/ScreenLayout';

export const SquawkLegend = ({
  checked,
  checkbox,
  bulkActions,
  action,
  actions,
  open,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const SquawkLegendTooltip = (
    <ToolTip
      visible={tooltipVisible}
      onDismiss={() => setTooltipVisible(false)}
      anchor={
        <IconButton
          icon="help"
          onPress={() => setTooltipVisible(current => !current)}
        />
      }>
      <Box ph={1}>
        <Text>MEL - Minimum Equipment List</Text>
        <Text>UFW - Unflightworthy</Text>
        <Text>UD - Undefined</Text>
        <Text>NS - No Squawks</Text>
      </Box>
    </ToolTip>
  );

  return (
    <LegendLayout>
      {checkbox}
      <Box dir="row" ml="auto" ai="center">
        <Indicator color="#FFC857" text="MEL" />
        <Indicator color="#DB3A34" text="UFW" />
        <Indicator color="#6E6E6E" text="UD" />
        <Indicator color="#7CB518" text="NS" />
        {SquawkLegendTooltip}
        {_.size(checked) > 0 && (
          <>
            <Button
              ml={1}
              ref={bulkActions.anchorEl}
              color="dark"
              icon="menu-down"
              onPress={open}
              loading={action.loading}
              iconSize={12}>
              States
            </Button>
            {actions}
          </>
        )}
      </Box>
    </LegendLayout>
  );
};

const LegendLayout = styled.View(({ theme }) => ({
  borderBottomColor: theme.colors.border,
  borderBottomWidth: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: theme.layout.space(0.5),
  paddingRight: theme.layout.space(2),
  paddingTop: theme.layout.space(1),
  paddingBottom: theme.layout.space(0.5),
  height: 76,
}));

const Bar = styled.View(({ theme, color }) => ({
  width: 4,
  borderRadius: 2,
  height: theme.layout.space(1),
  backgroundColor: _.get(theme.colors, color, color),
  marginRight: theme.layout.space(0.5),
}));

const Indicator = ({ color, text }) => (
  <Box dir="row" mr={1}>
    <Bar color={color} />
    <Text size="smallest">{text}</Text>
  </Box>
);

const ToolTip = styled(Menu)`
  margin-top: 35px;
`;
