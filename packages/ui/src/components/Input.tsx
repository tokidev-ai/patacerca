import React, { useRef, useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';
import { useKeyboardAwareScrollOnFocus } from '../keyboard-aware-scroll';

export interface InputProps extends TextInputProps {
  error?: string;
  label?: string;
  multiline?: boolean;
}

export const Input: React.FC<InputProps> = ({
  error,
  label,
  style,
  multiline,
  numberOfLines = 1,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const scrollOnFocus = useKeyboardAwareScrollOnFocus(inputRef);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={inputRef}
        placeholderTextColor="#8A7D70"
        onFocus={(event) => {
          setIsFocused(true);
          scrollOnFocus();
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          isFocused && styles.focused,
          Boolean(error) && styles.errorInput,
          style,
        ]}
        {...props}
      />
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Figtree_400Regular',
    color: '#2A2420',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  focused: {
    borderColor: '#3E8E5E',
  },
  errorInput: {
    borderColor: '#B4472B',
  },
  errorText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#B4472B',
    marginTop: 6,
  },
});
