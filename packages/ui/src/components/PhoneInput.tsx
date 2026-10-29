import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
} from 'react-native';

export interface PhoneInputProps extends Omit<TextInputProps, 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  error,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (text: string) => {
    // only numeric, max 8 digits
    const cleaned = text.replace(/\D/g, '').slice(0, 8);
    onChangeText(cleaned);
  };

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
        <TextInput
          value={value}
          onChangeText={handleChange}
          keyboardType="phone-pad"
          maxLength={8}
          placeholder="7XX XX XXX"
          placeholderTextColor="#8A7D70"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.input}
          {...props}
        />
      </View>
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
    </View>
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
  },
  prefixText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
  },
  input: {
    flex: 1,
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

