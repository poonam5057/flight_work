import React, { useRef } from 'react';
import type { ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View } from 'react-native';
import { Divider, TextInput } from 'react-native-paper';
import Text from '@appComponents/Text';
import {
  TextFormField,
  FirstNameFormField,
  EmailFormField,
  LastNameFormField,
  PhoneNumberFormField,
} from '@appComponents/forms/FormFields';
import { Title } from '@appComponents/Text';
import Button from '@appComponents/Button';
import styled from '@emotion/native';
import SearchField from '@appComponents/SearchField';
import PilotList from './PilotList';
import _ from 'lodash';
import Radio from '@appComponents/Radio';
import { RemoveButton } from '@appComponents/List';
import SelectOwner from './SelectOwner';
import { useCompanyData } from '@appUtils/api';
import { UserRole } from '@appUtils/tripConverter';

export const AircraftDetailsForm = ({
  control,
}: AircraftDetailsProps): Node => {
  return (
    <FormLayout>
      <Field
        control={control}
        label="Tail #"
        name="tailNumber"
        rules={{
          required: 'Tail # is required',
        }}
      />

      <Field control={control} label="Aircraft Name" name="name" />

      <Field
        control={control}
        label="Aircraft Type"
        name="type"
        rules={{
          required: 'Aircraft Type is required',
        }}
      />

      <EnginesField control={control} />

      <Field
        control={control}
        label="Last Location"
        name="location"
        maxLength={4}
      />

      <Field
        control={control}
        label="Current Fuel"
        name="fuelOff"
        rules={{
          pattern: {
            value: /^\d+$/i,
            message: 'This field is restricted to numbers only',
          },
        }}
        right={<TextInput.Affix text="lbs" />}
      />

      <PilotsField control={control} />
    </FormLayout>
  );
};

export const AircraftOwnersForm = ({ control }): ReactNode => {
  const searchRef = useRef(null);

  return (
    <Controller
      control={control}
      name="owners"
      defaultValue={[]}
      render={({ field, fieldState }) => (
        <FormCol alignSelf="stretch" mh={1}>
          <Text weight={700}>Search Owners</Text>

          <SelectOwner
            innerRef={searchRef}
            isClearable
            isOptionDisabled={o => _.some(field.value, u => u.id === o.id)}
            onChange={option => {
              if (option) {
                field.onChange([...field.value, _.omit(option, ['roles'])]);
              }
            }}
            onBlur={e => {
              field.onBlur(e);
              searchRef.current.clearValue();
            }}
            controlStyle={searchFieldStyle}
          />

          {fieldState.error && <Text>{fieldState.error.message}</Text>}

          <FormRow wrap="wrap" mt={1} alignItems="flex-start">
            <FormRow height="auto">
              <Text weight={700}>Select a Primary Owner</Text>
            </FormRow>

            {_.size(field.value) > 0 &&
              field.value.map(o => (
                <OwnerItem
                  key={o.id}
                  checked={o === _.head(field.value)}
                  owner={o}
                  onCheck={() =>
                    field.onChange([o, ...field.value.filter(v => v !== o)])
                  }
                  onRemove={() =>
                    field.onChange(field.value.filter(v => v !== o))
                  }
                />
              ))}

            {_.isEmpty(field.value) && (
              <Text>Use the search field to add owners</Text>
            )}
          </FormRow>

          {/* Todo: This is removed for DEMOS */}
          {/*<FormDivider />*/}
          {/*<AddAircraftOwnerForm*/}
          {/*  onNewOwnerAdded={owner => field.onChange([...field.value, owner])}*/}
          {/*/>*/}
        </FormCol>
      )}
    />
  );
};

const AddAircraftOwnerForm = ({ onNewOwnerAdded }): ReactNode => {
  const { control, handleSubmit, reset } = useForm();

  const submitCallback = React.useCallback(
    payload => {
      const name = payload.firstName + ' ' + payload.lastName;

      // Todo: api call to save owner to management company and invite
      onNewOwnerAdded({ name });
      reset();
    },
    [onNewOwnerAdded, reset],
  );

  return (
    <FormCol alignSelf="stretch">
      <FormAltTitle>Add New Owner</FormAltTitle>

      <FormRow>
        <FormCol mr={0.5}>
          <FirstNameFormField control={control} />
        </FormCol>
        <FormCol mr={0.5}>
          <LastNameFormField control={control} />
        </FormCol>
      </FormRow>
      <FormRow>
        <FormCol mr={0.5}>
          <EmailFormField control={control} />
        </FormCol>
        <FormCol mr={0.5}>
          <PhoneNumberFormField control={control} />
        </FormCol>
      </FormRow>
      <AddAndInviteButton
        color="primary"
        onPress={handleSubmit(submitCallback)}>
        Add & Invite
      </AddAndInviteButton>
    </FormCol>
  );
};

const EnginesField = ({ control }) => (
  <FormRow>
    <FormCol alignSelf="center">
      <Text>Number of Engines</Text>
    </FormCol>
    <FormCol flex={2}>
      <Controller
        control={control}
        name="numEngines"
        defaultValue={1}
        render={({ field, fieldState }) => (
          <>
            <SearchField
              options={[1, 2, 3].map(n => ({ value: n }))}
              defaultValue={{ value: field.value }}
              getOptionLabel={o => o.value}
              onChange={o => field.onChange(o.value)}
              onBlur={field.onBlur}
              controlStyle={searchFieldStyle}
            />
            {fieldState.error && <Text>{fieldState.error.message}</Text>}
          </>
        )}
      />
    </FormCol>
  </FormRow>
);

const PilotsField = ({ control }) => {
  const [company] = useCompanyData();
  const pilots = _.filter(company?.users, u =>
    u.roles.includes(UserRole.PILOT),
  );

  return (
    <>
      <FormRow height="auto">
        <FormCol>
          <Text>Assigned Pilots</Text>
        </FormCol>
      </FormRow>
      <FormRow mt={0.5}>
        <FormCol ml={0.5} alignSelf="stretch">
          <Controller
            control={control}
            name="pilots"
            render={({ field, fieldState }) => (
              <>
                <PilotList
                  selected={field.value}
                  options={pilots}
                  onChange={field.onChange}
                  numColumns={2}
                  maxEntries={100}
                />
                {fieldState.error && <Text>{fieldState.error.message}</Text>}
                {_.isEmpty(field.value) && (
                  <Text>
                    Use the add button to assign some of your existing pilots
                    here
                  </Text>
                )}
              </>
            )}
          />
        </FormCol>
      </FormRow>
    </>
  );
};

const Field = ({ label, control, name, ...rest }) => (
  <FormRow>
    <FormCol alignSelf="center">
      <Text>{label}</Text>
    </FormCol>
    <FormCol flex={2}>
      <TextFormField
        light
        label={label}
        name={name}
        control={control}
        {...rest}
      />
    </FormCol>
  </FormRow>
);

const OwnerItem = ({ owner, onCheck, checked, onRemove }) => (
  <FormRow width="50%" height="auto">
    <Radio
      label={
        <>
          {owner.firstName} {owner.lastName}
        </>
      }
      value={owner.id}
      checked={checked}
      onChange={checked ? undefined : onCheck}
    />
    <RemoveButton onPress={onRemove} />
  </FormRow>
);

type AircraftDetailsProps = {
  control: Control,
};

const FormLayout = styled(View)(({ theme }) => ({
  flex: 1,
  marginBottom: theme.layout.space(1),
  width: '80%',
  alignSelf: 'center',
}));

const FormRow = styled.View`
  flex-direction: row;
  align-items: ${({ alignItems = 'center' }) => alignItems};
  justify-content: space-between;
  width: ${({ width = '100%' }) =>
    Number.isInteger(width) ? width + 'px' : width};
  min-height: ${({ height = 82 }) => height.toString()}px;
  flex-wrap: ${({ wrap }) => wrap};
  margin-top: ${({ theme, mt }) =>
    mt && `${theme.layout.space(mt).toString()}px`};
`;

const FormCol = styled.View(
  ({ theme, flex = 1, alignSelf = 'flex-start', mr, mh, ml }) => ({
    flexDirection: 'column',
    flex,
    alignSelf,
    marginHorizontal: mh && theme.layout.space(mh),
    marginRight: mr && theme.layout.space(mr),
    marginLeft: ml && theme.layout.space(ml),
  }),
);

const FormAltTitle = styled(Title)(({ theme }) => ({
  marginTop: theme.layout.gap(2),
  marginBottom: theme.layout.space(1),
}));

const searchFieldStyle = {
  height: 56,
  marginTop: 8,
};

const FormDivider = styled(Divider)(({ theme }) => ({
  marginVertical: theme.layout.space(1),
}));

const AddAndInviteButton = styled(Button)(({ theme }) => ({
  marginTop: theme.layout.space(0.5),
  marginLeft: theme.layout.gap(1),
  alignSelf: 'flex-start',
}));
