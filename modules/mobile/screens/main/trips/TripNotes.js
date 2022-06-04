/**
 * @file
 * View and edit Trip Notes
 *
 * @format
 * @flow strict-local
 */
import React, { useState } from 'react';
import styled from '@emotion/native';
import { Dialog, Portal } from 'react-native-paper';

import Button, { BorderedButton } from '@appComponents/Button';

type TripNotesButtonProps = {
  onSave: string => void,
  notes: string,
};

const TripNotesButton = ({ onSave, notes, ...rest }: TripNotesButtonProps) => {
  const [notesVisible, setNotesVisible] = useState(false);

  return (
    <>
      <BorderedButton onPress={() => setNotesVisible(true)} {...rest}>
        Trip Notes
      </BorderedButton>
      {notesVisible && (
        <NotesDialog
          onDismiss={() => setNotesVisible(false)}
          onSave={onSave}
          notes={notes}
        />
      )}
    </>
  );
};

const NotesDialog = ({ onDismiss, onSave, notes }) => {
  const [currentNotes, setCurrentNotes] = useState(notes ?? '');

  return (
    <Portal>
      <NotesDialogLayout visible onDismiss={onDismiss}>
        <Title>Trip Notes</Title>
        <Content>
          <Notes
            autoFocus
            multiline
            value={currentNotes}
            onChangeText={setCurrentNotes}
          />
        </Content>
        <Actions>
          <Button color="error" onPress={onDismiss}>
            Cancel
          </Button>
          <Button
            ml={1}
            onPress={() => {
              onDismiss();
              onSave(currentNotes);
            }}>
            Save
          </Button>
        </Actions>
      </NotesDialogLayout>
    </Portal>
  );
};

const NotesDialogLayout: typeof Dialog = styled(Dialog)(({ theme }) => ({
  marginTop: '10%',
  height: '50%',
  marginBottom: 'auto',
}));

const Title = styled(Dialog.Title)(({ theme }) => ({
  marginBottom: theme.layout.space(1),
}));

const Content = styled(Dialog.Content)(({ theme }) => ({
  paddingTop: theme.layout.space(1),
  paddingHorizontal: theme.layout.space(1),
  marginHorizontal: theme.layout.space(2),
  backgroundColor: theme.colors.background,
  flex: 1,
  borderRadius: theme.roundness,
}));

const Actions = styled(Dialog.Actions)(({ theme }) => ({
  marginTop: theme.layout.space(1),
  paddingBottom: theme.layout.space(2),
  paddingHorizontal: theme.layout.space(2),
}));

const Notes = styled.TextInput(({ theme }) => ({
  color: theme.colors.text,
  fontSize: theme.fonts.size.small,
}));

export default TripNotesButton;
