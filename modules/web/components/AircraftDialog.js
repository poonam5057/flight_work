import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { View, ScrollView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import styled from '@emotion/native';
import { useForm } from 'react-hook-form';

import Button from '@appComponents/Button';
import Dialog from '@appComponents/Dialog';
import {
  createAircraft,
  updateAircraft,
  useAircraftData,
} from '@appUtils/aircraft';
import Notification from '@appComponents/Notification';
import { AircraftDetailsForm, AircraftOwnersForm } from './AircraftDialogForm';
import Steps from './Steps';
import _ from 'lodash';

type AircraftDialogProps = {
  mode: 'Add' | 'Edit',
  closeDialog: () => {},
  documentPath?: string,
};

export const useAircraftDialog = ({ mode, documentPath }) => {
  const [showDialog, setShowDialog] = useState(false);
  const closeDialog = useCallback(() => setShowDialog(false), []);
  const openDialog = useCallback(() => setShowDialog(true), []);

  // We're intentionally unmounting so the form in the dialog
  // can be reset automatically on next mount
  const dialogNode = showDialog && (
    <AircraftDialog
      mode={mode}
      closeDialog={closeDialog}
      documentPath={documentPath}
    />
  );

  return {
    dialogNode,
    openDialog,
    closeDialog,
  };
};

const AircraftDialog = ({
  mode,
  closeDialog,
  documentPath,
}: AircraftDialogProps): ReactNode => {
  const [activeIndex, setActiveIndex] = useState(0);
  const title = activeIndex === 0 ? `${mode} Aircraft` : `${mode} Owners`;

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState,
    reset,
    getValues,
    trigger,
  } = useForm({
    defaultValues: AIRCRAFT_DEFAULTS,
  });

  const loading = useExistingData(documentPath, reset);
  const submitCallback = useSubmitCallback({
    setError,
    closeDialog,
    documentPath,
  });

  const changeStep = useCallback(async () => {
    const isValid = await trigger();

    if (isValid) {
      setActiveIndex(current => {
        return Math.abs(current - 1);
      });
    }
  }, [trigger]);

  const steps = useMemo(
    () => [
      {
        name: 'Aircraft Details',
        isComplete: getValues('tailNumber').length > 0,
        render: () => <AircraftDetailsForm control={control} />,
      },
      {
        name: 'Owners',
        isComplete: getValues('owners').length > 0,
        render: () => <AircraftOwnersForm control={control} />,
      },
    ],
    [control, getValues],
  );

  return (
    <DialogLayout
      visible
      title={title}
      onDismiss={closeDialog}
      actionSlot={
        <ButtonContainer>
          <Button color="primary" onPress={changeStep}>
            {activeIndex === 0 ? 'Next' : 'Back'}
          </Button>

          <Button ml="auto" color="disabled" onPress={closeDialog}>
            Cancel
          </Button>
          <Button ml={1} color="primary" onPress={handleSubmit(submitCallback)}>
            Save
          </Button>
        </ButtonContainer>
      }>
      <BuildSteps
        steps={steps}
        onStepPress={changeStep}
        activeIndex={activeIndex}
      />
      <ScrollView contentContainerStyle={scrollContainerStyle}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          steps[activeIndex].render()
        )}

        <Notification
          color="error"
          visible={formState.errors?.general}
          onDismiss={() => clearErrors()}>
          {formState.errors?.general?.message}
        </Notification>
      </ScrollView>
    </DialogLayout>
  );
};

const useExistingData = (documentPath, formReset) => {
  const [existingData, loadingData] = useAircraftData(documentPath);

  useEffect(() => {
    if (!documentPath || loadingData) {
      return;
    }

    formReset(existingData);
  }, [formReset, existingData, documentPath, loadingData]);

  return Boolean(documentPath && loadingData);
};

const useSubmitCallback = ({ documentPath, setError, closeDialog }) =>
  useCallback(
    payload => {
      const filteredPayload = _.omitBy(payload, _.isUndefined);
      const task = documentPath
        ? updateAircraft(filteredPayload, documentPath)
        : createAircraft(filteredPayload);

      task
        .then(() => closeDialog())
        .catch(error => {
          setError('general', { type: 'manual', message: error.message });
        });
    },
    [documentPath, setError, closeDialog],
  );

const AIRCRAFT_DEFAULTS = {
  tailNumber: '',
  name: '',
  type: '',
  numEngines: 1,
  location: '',
  fuel: '',
  owners: [],
  pilots: [],
};

const BuildSteps = styled(Steps)(({ theme }) => ({
  marginTop: 0,
  alignSelf: 'center',
  width: 400,
  marginBottom: theme.layout.space(4),
}));

const ButtonContainer = styled(View)(({ theme }) => ({
  flex: 1,
  flexDirection: 'row',
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
  paddingTop: theme.layout.space(1),
  paddingHorizontal: theme.layout.space(1),
}));

const DialogLayout = styled(Dialog)(({ theme }) => ({
  height: theme.layout.height - 0.1 * theme.layout.height,
}));

const scrollContainerStyle = {
  height: '100%',
};

export default AircraftDialog;
