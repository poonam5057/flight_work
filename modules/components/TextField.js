/**
 * @file
 * Our custom Text Field
 * See https://callstack.github.io/react-native-paper/text-input for additional props
 *
 * @format
 * @flow strict-local
 */
import * as React from 'react';
import type { Node, ElementRef } from 'react';
import type { ViewStyle } from 'react-native';
import { Platform } from 'react-native';

import { HelperText, TextInput } from 'react-native-paper';
import styled from '@emotion/native';
import color from 'color';
import { useTheme } from './theme';

const TextField = ({
  mode = 'outlined',
  errorMessage,
  wrapStyle,
  inputRef,
  light,
  disabled,
  backgroundColor,
  ...rest
}: TextFieldProps): Node => {
  const { outline, ...colors } = useColors({
    light,
    disabled,
    backgroundColor,
  });

  return (
    <FieldWrap style={wrapStyle}>
      <TextInput
        theme={{ colors }}
        mode={mode}
        outlineColor={outline}
        ref={inputRef}
        disabled={disabled}
        {...rest}
      />
      {Boolean(errorMessage) && (
        <HelperText type="error" visible>
          {errorMessage}
        </HelperText>
      )}
    </FieldWrap>
  );
};

export const PasswordField = (props: TextFieldProps): Node => {
  const [passVisible, setPassVisible] = React.useState(false);

  const { placeholder } = useColors();

  return (
    <TextField
      secureTextEntry={!passVisible}
      right={
        <TextInput.Icon
          color={placeholder}
          name={!passVisible ? 'eye' : 'eye-off'}
          onPress={() => setPassVisible(!passVisible)}
        />
      }
      {...props}
    />
  );
};

type TextFieldProps = {
  /**
   * Value of the text field
   */
  value?: string,
  /**
   * Label of the text field
   */
  label: string,
  /**
   * Function to execute on text/value change
   */
  onChangeText?: () => void,
  /**
   * If true, user won't be able to interact with the component.
   */
  disabled?: boolean,
  /**
   * Whether the field's background is light.
   */
  light?: boolean,
  /**
   * Whether to style the text field with error style.
   */
  error?: boolean,
  /**
   * Error message for showing in helper text
   */
  errorMessage?: string,

  /**
   * Field wrap styles
   */
  wrapStyle?: ViewStyle,

  /**
   * Get a ref to the underlying text input
   */
  inputRef?: ElementRef,
};

TextField.defaultProps = {
  value: '',
  disabled: false,
  error: false,
  errorMessage: '',
};

const FieldWrap = styled.View(({ theme }) => ({
  marginBottom: theme.layout.space(1.125),
}));

export const useColors = ({ light, disabled, backgroundColor } = {}) => {
  const theme = useTheme();

  if (Platform.OS !== 'web') {
    const text = theme.colors.text;
    const placeholder = theme.colors.placeholder;
    const background = backgroundColor ?? theme.colors.fieldBackground;
    const primary = theme.colors.heading;

    return { text, placeholder, background, primary };
  } else {
    const text = color(theme.colors.onSurface).fade(0.13).toString();
    const placeholder = color(theme.colors.onSurface).fade(0.4).toString();
    const outline = color(theme.colors.onSurface).fade(0.88).toString();
    const background = theme.colors.surface;

    return {
      text,
      placeholder,
      outline,
      ...(!disabled && light && { background }),
    };
  }
};

export default TextField;
