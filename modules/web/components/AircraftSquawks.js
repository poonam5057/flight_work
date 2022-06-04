import React, { useCallback, useEffect, useState } from 'react';
import { Box, MainSurface, Spacer } from '@appComponents/ScreenLayout';
import Text from '@appComponents/Text';
import {
  useAircraftSquawkList,
  SquawkStatus,
  updateSquawk,
} from '@appUtils/squawks';
import { List } from 'react-native-paper';
import styled from '@emotion/native';
import { View } from 'react-native';
import { TextFormField } from '@appComponents/forms/FormFields';
import { Controller, useForm } from 'react-hook-form';
import { ImageViewer } from '@appComponents/ImageViewer';
import { Icon } from '@appComponents/theme';
import { DateTime } from 'luxon';
import Select from 'react-select';
import Button from '@appComponents/Button';
import { Divider } from 'react-native-paper';

export const AircraftSquawks = ({ aircraftId, archived = false }) => {
  const { data: squawks } = useAircraftSquawkList({ aircraftId, archived });

  return (
    <MainSurface>
      <ScrollWrapper>
        <Box ph={2}>
          <Header>
            <AccordionText weight={700} flex={2.6}>
              TITLE
            </AccordionText>
            <AccordionText weight={700}>TRIP ID</AccordionText>
            <AccordionText weight={700}>REPORTED</AccordionText>
            <AccordionText weight={700} flex={0.8}>
              PRIORITY
            </AccordionText>
          </Header>
          {squawks.map(squawk => (
            <SquawkContent squawk={squawk} />
          ))}
        </Box>
      </ScrollWrapper>
    </MainSurface>
  );
};

const SquawkContent = ({ squawk }) => {
  const [expanded, setExpanded] = useState(false);
  const [editable, setEditable] = useState(false);
  const handlePress = () => setExpanded(!expanded);
  const defaultValues = {
    title: squawk?.title ?? '',
    description: squawk?.description ?? '',
    currentStatus: squawk?.currentStatus
      ? { value: squawk.currentStatus, label: squawk.currentStatus }
      : { value: SquawkStatus.UNDEFINED, label: SquawkStatus.UNDEFINED },
    status: squawk.status,
  };

  const {
    control,
    formState: { dirtyFields, isDirty, isSubmitSuccessful },
    getValues,
    handleSubmit,
    reset,
  } = useForm({ defaultValues });

  const update = handleSubmit(
    useCallback(
      async payload => {
        if (isDirty) {
          const filteredPayload = {
            ...payload,
            currentStatus: payload.currentStatus.value,
          };
          await updateSquawk({
            payload: filteredPayload,
            squawkPath: squawk.path,
            statusChanged: dirtyFields.currentStatus,
          });
        }
      },
      [dirtyFields.currentStatus, isDirty, squawk.path],
    ),
  );

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset(getValues());
    }
  }, [getValues, isSubmitSuccessful, reset]);

  const accordionTitle = (
    <Row>
      <AccordionText flex={2.5}>{squawk.title ?? '-'}</AccordionText>
      <AccordionText>{squawk.trip?.identifier ?? '-'}</AccordionText>
      <AccordionText>
        {squawk.dateCreated
          ? DateTime.fromSeconds(squawk.dateCreated.seconds).toLocaleString(
              DateTime.DATE_SHORT,
            )
          : '-'}
      </AccordionText>
      <AccordionText flex={0.5}>{squawk.currentStatus ?? '-'}</AccordionText>
    </Row>
  );

  return (
    <>
      <SquawkAccordion
        title={accordionTitle}
        right={() => null}
        left={() => <ExpansionIcon name={expanded ? 'menu-down' : 'menu-up'} />}
        expanded={expanded}
        onPress={handlePress}>
        <SquawkBox ph={2}>
          <Spacer size={4} />
          <Row jc="flex-start">
            <Label text="TITLE" />
            <EditSlot
              editable={editable}
              setEditable={setEditable}
              update={update}
            />
          </Row>
          <TextField editable={editable} name="title" control={control} />
          <Spacer />
          <Label text="DESCRIPTION" />
          <TextField editable={editable} name="description" control={control} />
          <Spacer />
          <Label text="IMAGES" />
          <SectionDivider width="8%" />
          <ImageViewerExample />
          <Spacer />
          <Label text="STATUS" />
          <SectionDivider />
          <StatusDropdown control={control} disabled={!editable} />
          <Spacer size={4} />
        </SquawkBox>
      </SquawkAccordion>
      <Spacer size={0.2} />
    </>
  );
};

const statusOptions = [
  { value: SquawkStatus.UNDEFINED, label: SquawkStatus.UNDEFINED },
  { value: SquawkStatus.MEL, label: SquawkStatus.MEL },
  { value: SquawkStatus.UNFLIGHTWORTHY, label: SquawkStatus.UNFLIGHTWORTHY },
  { value: SquawkStatus.ARCHIVED, label: SquawkStatus.ARCHIVED },
];

const StatusDropdown = ({ control, disabled }) => {
  return (
    <Controller
      control={control}
      name="currentStatus"
      render={({ field: { onChange, value } }) => {
        return (
          <SelectWrap>
            <Select
              value={value}
              onChange={onChange}
              isDisabled={disabled}
              options={statusOptions}
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 99 }) }}
            />
          </SelectWrap>
        );
      }}
    />
  );
};

const Header = styled(View)`
  flex-direction: row;
  width: 100%;
  justify-content: space-evenly;
  padding-left: 60;
`;

const AccordionText = styled(Text)(
  ({ flex, textAlign, paddingLeft, marginLeft }) => ({
    flex: flex ?? 1,
    textAlign: textAlign ?? 'left',
    paddingLeft: paddingLeft ?? 0,
    marginLeft: marginLeft ?? 0,
    overflow: 'hidden',
  }),
);

const ExpansionIcon = styled(Icon)`
  padding-horizontal: 14;
`;

const EditSlot = ({ editable, setEditable, update }) => {
  const editButton = (
    <Button
      icon="edit"
      mode="outlined"
      color="dark"
      ml={1}
      onPress={() => setEditable(true)}
    />
  );

  const saveButton = (
    <Button
      icon="check"
      mode="outlined"
      color="dark"
      ml={1}
      onPress={() => {
        update();
        setEditable(false);
      }}
    />
  );

  return editable ? saveButton : editButton;
};

const Row = styled(View)(({ jc }) => ({
  flexDirection: 'row',
  width: '100%',
  justifyContent: jc ?? 'space-evenly',
  alignItems: 'center',
}));

const TextField = styled(TextFormField)(({ editable, theme }) => ({
  width: '60%',
  backgroundColor: editable ? 'transparent' : theme.colors.background,
}));

const SelectWrap = styled(View)`
  width: 35%;
`;

const ScrollWrapper = styled.ScrollView(({ theme }) => ({
  padding: theme.layout.space(3),
}));

const Label = ({ text }) => (
  <LabelWrap weight={700} size="smallest">
    {text}
  </LabelWrap>
);

const LabelWrap = styled(Text)`
  margin-left: 16px;
`;

const SquawkAccordion = styled(List.Accordion)`
  padding-bottom: 10px;
`;

const SectionDivider = styled(Divider)(({ theme, width }) => ({
  marginVertical: theme.layout.space(1),
  width: width ?? '80%',
}));

const SquawkBox = styled(Box)(({ theme }) => ({
  borderColor: theme.colors.background,
  borderWidth: 2,
  borderRadius: 5,
  marginTop: 1,
}));

const ImageViewerExample = () => {
  const images = [
    {
      thumbnail:
        'https://images.unsplash.com/photo-1574266965598-733f8ff7e41a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=60',
      original:
        'https://images.unsplash.com/photo-1574266965598-733f8ff7e41a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    },
    {
      thumbnail:
        'https://images.unsplash.com/photo-1610171310539-abaf3344489e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=60',
      original:
        'https://images.unsplash.com/photo-1610171310539-abaf3344489e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    },
    {
      thumbnail:
        'https://images.unsplash.com/photo-1623053795318-f8bb2f5897dd?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=60',
      original:
        'https://images.unsplash.com/photo-1623053795318-f8bb2f5897dd?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    },
    {
      thumbnail:
        'https://images.unsplash.com/photo-1610171310539-abaf3344489e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=60',
      original:
        'https://images.unsplash.com/photo-1610171310539-abaf3344489e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    },
  ];

  return <ImageViewer images={images} />;
};
