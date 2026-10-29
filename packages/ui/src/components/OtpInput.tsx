import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
} from 'react-native';

export interface OtpInputProps extends Omit<TextInputProps, 'onChangeText'> {
  value: string;
  onChangeText: (code: string) => void;
  error?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChangeText,
  error,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    onChangeText(cleaned);
  };

  return (
    <View style={styles.wrapper}>
      <TextInput
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={4}
        placeholder="0000"
        placeholderTextColor="#8A7D70"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
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
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 14,
    paddingVertical: 14,
    fontSize: 30,
    fontFamily: 'Figtree_600SemiBold',
    letterSpacing: 10,
    textAlign: 'center',
    color: '#2A2420',
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
    marginTop: 8,
    textAlign: 'center',
  },
});

