import React, { Node } from 'react';
import { Controller, Control } from 'react-hook-form';
import TextField, { PasswordField } from '@appComponents/TextField';
import RadioGroup from '@appComponents/RadioGroup';
import { useTheme } from '../theme';
import DialogDatePicker from '../../mobile/components/DialogDatePicker';
import * as Phone from '@appUtils/phone';
import { UserRole } from '@appUtils/tripConverter';

export const RULES = optional => ({
  EMAIL: {
    ...(!optional && { required: 'Email is required' }),
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
      message: 'Enter a valid email address',
    },
  },
  FIRST_NAME: {
    ...(!optional && { required: 'First Name is required' }),
    pattern: {
      value: /^(?!\s*$).+$/i,
      message: 'First Name cannot be blank',
    },
  },
  LAST_NAME: {
    ...(!optional && { required: 'Last Name is required' }),
    pattern: {
      value: /^(?!\s*$).+$/i,
      message: 'Last Name cannot be blank',
    },
  },
  PHONE: {
    ...(!optional && { required: 'Phone Number is required' }),
    validate: value => {
      if (optional && !value) {
        return true;
      }

      return Phone.parse(value)?.isValid()
        ? true
        : 'Enter a valid 10-digit phone number';
    },
  },
});

export const TextFormField = ({
  label,
  name,
  control,
  rules,
  disabled = false,
  ...rest
}: TextFormFieldProps): Node => (
  <Controller
    control={control}
    name={name}
    rules={rules}
    shouldUnregister={false}
    render={({ field: { onChange, value, onBlur }, fieldState: { error } }) =>
      renderTextField(label, onChange, value, onBlur, error, disabled, rest)
    }
  />
);

export const EmailFormField = ({
  control,
  optional = false,
}: FormFieldProps): Node => (
  <TextFormField
    label="Email"
    name="email"
    control={control}
    rules={RULES(optional).EMAIL}
  />
);

export const FirstNameFormField = ({
  control,
  optional = false,
}: FormFieldProps): Node => (
  <TextFormField
    label="First Name"
    name="firstName"
    control={control}
    rules={RULES(optional).FIRST_NAME}
  />
);

export const LastNameFormField = ({
  control,
  optional = false,
}: FormFieldProps): Node => (
  <TextFormField
    label="Last Name"
    name="lastName"
    control={control}
    rules={RULES(optional).LAST_NAME}
  />
);

export const PasswordFormField = ({
  control,
  name = 'password',
  label = 'Password',
  optional = false,
  ...rest
}: FormFieldProps): Node => (
  <Controller
    control={control}
    name={name}
    rules={!optional && { required: 'Password is required' }}
    render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
      <PasswordField
        label={label}
        value={value}
        onBlur={onBlur}
        onChangeText={onChange}
        error={error}
        errorMessage={error?.message}
        {...rest}
      />
    )}
  />
);

export const RoleFormField = ({ control }: FormFieldProps): Node => {
  const theme = useTheme();
  return (
    <Controller
      control={control}
      name="role"
      rules={{
        required: 'Role is required',
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) =>
        renderRolesRadioGroup(onChange, value, error, theme.colors.primary)
      }
    />
  );
};

export const PhoneNumberFormField = ({
  label = 'Phone Number',
  name = 'phone',
  control,
  optional = false,
  rules = RULES(optional).PHONE,
  disabled = false,
  rest,
}: TextFormFieldProps): Node => (
  <Controller
    control={control}
    name={name}
    rules={rules}
    shouldUnregister={false}
    render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => {
      const phoneNumber = Phone.parse(value ?? '');
      const val = phoneNumber?.isValid() ? phoneNumber.formatNational() : value;
      return (
        <TextField
          label={label}
          value={val}
          onBlur={onBlur}
          onChangeText={onChange}
          error={error}
          errorMessage={error?.message}
          disabled={disabled}
          {...rest}
        />
      );
    }}
  />
);

const renderTextField = (
  label,
  onChange,
  value,
  onBlur,
  error,
  disabled,
  rest,
) => (
  <TextField
    label={label}
    value={value}
    onBlur={onBlur}
    onChangeText={onChange}
    error={error}
    errorMessage={error?.message}
    disabled={disabled}
    {...rest}
  />
);

const renderRolesRadioGroup = (onChange, value, error, color) => {
  const options = [
    {
      value: UserRole.OWNER,
      label: 'I am an Aircraft Owner',
    },
    {
      value: UserRole.PILOT,
      label: 'I am a Pilot',
    },
    {
      value: 'neither',
      label: 'I am neither and i want to learn more',
    },
  ];

  return (
    <RadioGroup
      options={options}
      value={value}
      color={color}
      onChange={onChange}
      errorMessage={error?.message}
    />
  );
};

export const DialogDateTimeFormField = ({
  control,
  mode,
  label,
  name,
}): Node => {
  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: `Departure ${mode} is required`,
      }}
      render={({ field: { onChange, value } }) =>
        renderDialogDateTimePicker(label, value, onChange, mode)
      }
    />
  );
};

const renderDialogDateTimePicker = (label, value, onChange, mode) => (
  <DialogDatePicker
    label={label}
    mode={mode}
    value={value}
    onChange={onChange}
  />
);

export const CodeField = ({ control }) => (
  <TextFormField
    control={control}
    label="Sign Up Code"
    name="signUpCode"
    rules={{
      required: 'Ask your management company for their signup code',
      pattern: {
        value: /^C[A-Z\d]{4}$/i,
        message: 'Invalid code',
      },
    }}
  />
);

export const UserMessageField = ({ control, mode, style }) => (
  <TextFormField
    multiline
    mode={mode}
    control={control}
    label="What would you like to know about Flight App"
    name="message"
    style={style}
    rules={{
      maxLength: {
        value: 500,
        message: 'Maximum message length reached',
      },
    }}
  />
);

export const FullNameField = ({ control, required = true }) => (
  <TextFormField
    multiline
    control={control}
    label="Name"
    name="name"
    rules={{
      required: required ? 'Please enter your name' : false,
    }}
  />
);

type TextFormFieldProps = {
  label: String,
  name: String,
  control: Control,
  rules?: Object,
  disabled?: Boolean,
};

type FormFieldProps = {
  control: Control,
};
