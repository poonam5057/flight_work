/**
 * @file
 * React hook reacting to navigation away of the Trip builder
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback, useRef, useState } from 'react';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';

import Dialog from '@appComponents/Dialog';
import Text from '@appComponents/Text';
import Button from '@appComponents/Button';
import { Spacer } from '@appComponents/ScreenLayout';

type confirmationConfig = {
  hasUnsavedChanges: boolean,
  canSave: boolean,
  save: () => void,
  init: () => void,
};

const useExitTripBuilderConfirmation = (
  state: confirmationConfig,
  navigation: NavigationProp,
) => {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [screenVisible, setScreenVisible] = useState(false);
  const builderState = useRef();
  builderState.current = state;
  const navState = useRef();

  const saveChanges = useCallback(async () => {
    setConfirmVisible(false);
    await builderState.current.save();
  }, []);

  const discardChanges = useCallback(() => setConfirmVisible(false), []);

  const goBack = useCallback(() => {
    navigation.reset(navState.current);
    navState.current = null;
  }, [navigation]);

  const focusEffect = useCallback(() => {
    // Re-initialize builder on open, unless it's from "go back"
    if (navState.current) {
      builderState.current.init();
    }

    // Capture current nav state in case we need to restore it with "go back"
    navState.current = navigation.getState();
    setConfirmVisible(false);
    setScreenVisible(true);

    return () => {
      setScreenVisible(false);

      if (builderState.current.hasUnsavedChanges) {
        setConfirmVisible(true);
      }
    };
  }, [navigation]);

  useFocusEffect(focusEffect);

  const confirmationNode = (
    <Dialog
      title="Unsaved Changes"
      visible={Boolean(confirmVisible)}
      dismissable={false}
      actionSlot={
        <>
          <Button mode="outlined" color="dark" onPress={goBack}>
            Go Back
          </Button>
          <Spacer dir="horizontal" />

          <Button mode="outlined" color="error" onPress={discardChanges}>
            Discard Changes
          </Button>
          <Spacer dir="horizontal" />

          {state.canSave && (
            <>
              <Button onPress={saveChanges}>Save and Send</Button>
              <Spacer dir="horizontal" />
            </>
          )}
        </>
      }>
      {state.canSave ? (
        <Text>
          You have unsaved changes on this trip. Do you want to save and send
          these changes?
        </Text>
      ) : (
        <Text>
          This trip doesn't have the minimum information needed to save it. If
          you want to save this trip go back and enter the required information.
        </Text>
      )}
    </Dialog>
  );

  return { screenVisible, confirmationNode };
};

export default useExitTripBuilderConfirmation;
