/**
 * @file
 * Trip Custom name editable field
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback } from 'react';
import styled from '@emotion/native';

import { Box } from '@appComponents/ScreenLayout';
import TextField from '@appComponents/TextField';

type TripNameProps = {
  value?: string,
  onChange: string => void,
};

const TripName = ({ value, onChange }: TripNameProps): Node => {
  const handleChange = useCallback(text => onChange(text), [onChange]);

  return (
    <Box dir="row">
      <NameField
        dense
        label="Trip Name"
        value={value}
        onChangeText={handleChange}
      />
    </Box>
  );
};

const NameField = styled(TextField)(({ theme }) => ({
  marginRight: theme.layout.space(0.5),
  backgroundColor: theme.colors.surface,
  marginTop: theme.layout.gap(-1.5),
}));

export default TripName;
