import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { cleanBolivianPhone } from '@patacerca/core';

function cleanPhoneDigits(text: string): string {
  return cleanBolivianPhone(text).slice(0, 8);
}

export interface PhoneInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  /** Dígitos iniciales (8 max, sin +591). Solo define el valor al montar; luego manda el estado interno. */
  value: string;
  onChangeText: (digits: string) => void;
  error?: string;
  /** Cambia la key del TextInput para resetear (p. ej. al reabrir un modal). */
  remountKey?: string | number;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  error,
  style,
  remountKey,
  autoComplete = 'off',
  textContentType = 'none',
  importantForAutofill = 'no',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (text: string) => {
      const cleaned = cleanPhoneDigits(text);
      onChangeText(cleaned);
    },
    [onChangeText]
  );

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          isFocused && styles.focused,
          Boolean(error) && styles.errorContainer,
          style,
        ]}
      >
        <View style={styles.prefixContainer}>
          <Text style={styles.prefixText}>BO +591</Text>
        </View>
        <PhoneInputField
          key={remountKey ?? 'phone'}
          initialDigits={cleanPhoneDigits(value)}
          onDigitsChange={handleChange}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          error={error}
          autoComplete={autoComplete}
          textContentType={textContentType}
          importantForAutofill={importantForAutofill}
          {...props}
        />
      </View>
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

type PhoneInputFieldProps = Omit<
  TextInputProps,
  'value' | 'defaultValue' | 'onChangeText' | 'onFocus' | 'onBlur'
> & {
  initialDigits: string;
  onDigitsChange: (text: string) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  error?: string;
};

/** TextInput no controlado por el padre (defaultValue): evita que el dígito desaparezca al re-renderizar. */
const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  initialDigits,
  onDigitsChange,
  setIsFocused,
  ...props
}) => {
  const [digits, setDigits] = useState(initialDigits);

  const handleChange = (text: string) => {
    const cleaned = cleanPhoneDigits(text);
    setDigits(cleaned);
    onDigitsChange(cleaned);
  };

  return (
    <TextInput
      value={digits}
      onChangeText={handleChange}
      keyboardType="number-pad"
      placeholder="Ej. 71234567"
      placeholderTextColor="#8A7D70"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={styles.input}
      maxLength={8}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 14,
    overflow: 'hidden',
  },
  prefixContainer: {
    backgroundColor: '#F7F2EA',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1.5,
    borderRightColor: '#E6DCCD',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  prefixText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: 'Figtree_500Medium',
    color: '#2A2420',
  },
  focused: {
    borderColor: '#3E8E5E',
  },
  errorContainer: {
    borderColor: '#B4472B',
  },
  errorText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#B4472B',
    marginTop: 6,
  },
});
