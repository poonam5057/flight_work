/**
 * @file
 * Trip Notes Popup
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback, useState } from 'react';
import styled from '@emotion/native';
import { Menu } from 'react-native-paper';
import { TextInput } from 'react-native';

import Button from '@appComponents/Button';
import Text from '@appComponents/Text';
import { Box } from '@appComponents/ScreenLayout';

type TripNotesProps = {
  defaultValue?: string,
  onSave: string => void,
};

const TripNotes = ({
  defaultValue = '',
  onSave,
  ...rest
}: TripNotesProps): Node => {
  const [text, setText] = useState(defaultValue);
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const hasChanges = text !== defaultValue;

  const handleSave = useCallback(() => {
    setIsEditing(false);
    setVisible(false);

    if (hasChanges) {
      onSave(text);
    }
  }, [hasChanges, onSave, text]);

  const edit = useCallback(() => setIsEditing(true), []);

  const anchorIcon = visible ? 'arrow-drop-up' : 'arrow-drop-down';

  const anchor = (
    <Button icon={anchorIcon} onPress={() => setVisible(true)} {...rest}>
      Trip Notes
    </Button>
  );

  return (
    <NotesPopup visible={visible} onDismiss={handleSave} anchor={anchor}>
      <NotesSurface text={text}>
        <Box height={42} ph={1} dir="row" ai="center" jc="space-between">
          <Text color="dark" size="small" weight="500" lh={16} ls={1.25}>
            TRIP NOTES
          </Text>
        </Box>
        {isEditing && (
          <NotesField
            autoFocus
            multiline
            selection={{ start: text.length, end: text.length }}
            value={text}
            onChangeText={setText}
          />
        )}

        {!isEditing && <NotesText onPress={edit}>{text}</NotesText>}

        <Box height={40} ph={0.25} dir="row" ai="center" jc="flex-end">
          {isEditing && (
            <Button mode="text" onPress={handleSave} disabled={!hasChanges}>
              Save
            </Button>
          )}
          {!isEditing && <Button mode="text" icon="edit" onPress={edit} />}
        </Box>
      </NotesSurface>
    </NotesPopup>
  );
};

const NotesPopup: typeof Menu = styled(Menu)(({ theme }) => ({
  marginTop: theme.layout.space(3),
}));

const NotesSurface = styled.View(({ theme, text = '' }) => ({
  width: 360,
  minHeight: 170,
  maxHeight: 500,
  height: 80 + theme.layout.space(text.split('\n').length + 2),
  borderWidth: 3,
  borderColor: theme.colors.highlight,
  borderRadius: theme.roundness,
  backgroundColor: theme.colors.surface,
  marginVertical: theme.layout.space(-0.625),
  alignItems: 'stretch',
}));

const NotesText = styled(Text)(({ theme }) => ({
  flex: 1,
  paddingHorizontal: theme.layout.space(1),
  paddingVertical: theme.layout.space(0.5),
  lineHeight: theme.layout.space(1),
}));

const NotesField: typeof TextInput = styled.TextInput(({ theme }) => ({
  flex: 1,
  paddingHorizontal: theme.layout.space(1),
  paddingVertical: theme.layout.space(0.5),
  outlineWidth: 0,
  lineHeight: theme.layout.space(1),
}));

export default TripNotes;
