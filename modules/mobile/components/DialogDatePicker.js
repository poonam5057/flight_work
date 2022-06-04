import React from 'react';
import moment from 'moment';
import { TouchableOpacity } from 'react-native';
import styled from '@emotion/native';
import PropTypes from 'prop-types';
import DateTimePicker from '@react-native-community/datetimepicker';
import TextField from '@appComponents/TextField';
import Button from '@appComponents/Button';
import Dialog from '@appComponents/Dialog';

const DialogDatePicker = ({ onFocus, onChange, value, mode, label }) => {
  const [visible, setVisible] = React.useState(false);

  const handleFocus = React.useCallback(
    (...args) => {
      setVisible(true);
      return onFocus && onFocus(...args);
    },
    [onFocus, setVisible],
  );

  const handleChange = React.useCallback(
    (event, date) => onChange(date),
    [onChange],
  );

  const formattedDate =
    mode === 'date'
      ? moment(value).format('MM/DD/YYYY')
      : moment(value).format('hh:mm A');

  return (
    <FieldWrap>
      <TouchableOpacity onPress={handleFocus}>
        <FieldWrap pointerEvents="box-only">
          <TextField
            width={mode === 'date' ? 344 : 164}
            label={label}
            editable={false}
            value={formattedDate}
          />
        </FieldWrap>
      </TouchableOpacity>

      <StyledDialog
        visible={visible}
        actionSlot={
          <>
            <Button onPress={() => setVisible(false)}>CONFIRM</Button>
          </>
        }>
        <DatePickerView>
          <DateTimePicker
            value={value || new Date()}
            onChange={handleChange}
            display="spinner"
            textColor="white"
            timeZoneOffsetInSeconds={0}
            mode={mode}
          />
        </DatePickerView>
      </StyledDialog>
    </FieldWrap>
  );
};

DialogDatePicker.propTypes = {
  hasError: PropTypes.bool,
};

const FieldWrap = styled.View``;

const StyledDialog = styled(Dialog)`
  margin: 0px;
  height: 350px;
  background-color: ${({ theme }) => theme.colors.header};
`;

const DatePickerView = styled.View`
  height: 234px;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.header};
`;

export default DialogDatePicker;
