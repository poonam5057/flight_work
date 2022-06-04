import React from 'react';
import styled from '@emotion/native';
import Button from '@appComponents/Button';
import Text from '@appComponents/Text';
import Dialog from '@appComponents/Dialog';
import { Box } from '@appComponents/ScreenLayout';

const ConfirmationDialog = ({ visible = false, text = '', buttons = [] }) => (
  <ConfirmationDialogWrap
    dismissable={false}
    visible={visible}
    actionSlot={
      <ConfirmationFooter>
        {buttons.map((btn, i) => (
          <DialogButton
            key={i}
            width={100 / buttons.length}
            onPress={btn.onPress}
            title={btn.label}
            bl={i !== 0}
          />
        ))}
      </ConfirmationFooter>
    }>
    <DialogContent>
      <Text align="center" size="medium">
        {text}
      </Text>
    </DialogContent>
  </ConfirmationDialogWrap>
);

const ConfirmationDialogWrap = styled(Dialog)`
  min-height: 140px;
  background-color: ${({ theme }) => theme.colors.confirmationDialog};
`;

const DialogContent = styled.View(({ theme }) => ({
  justifyContent: 'center',
  flex: 1,
  marginTop: theme.layout.space(-1.5),
}));

const ConfirmationFooter = styled.View(({ theme }) => ({
  flexDirection: 'row',
  marginBottom: theme.layout.space(-1.5),
  width: '100%',
  borderTopWidth: 1,
  borderTopColor: 'white',
  marginHorizontal: theme.layout.space(-2),
  justifyContent: 'space-evenly',
  flex: 1,
  height: 60,
}));

const DialogButton = ({ title, onPress, bl, width }) => {
  return (
    <DialogButtonWrap mode="text" onPress={onPress} bl={bl} width={width}>
      <Box flex={1} jc="center">
        <Text align="center" size="medium" weight="700">
          {title}
        </Text>
      </Box>
    </DialogButtonWrap>
  );
};

const DialogButtonWrap = styled(Button)(({ theme, bl, width }) => ({
  borderColor: theme.colors.text,
  borderRadius: 0,
  borderLeftWidth: bl ? 1 : 0,
  width: `${width}%`,
}));

export default ConfirmationDialog;
