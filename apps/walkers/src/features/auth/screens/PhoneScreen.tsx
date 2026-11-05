import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, IconButton, PhoneInput, FormScreenLayout } from '@patacerca/ui';
import { isValidBolivianPhone, cleanBolivianPhone, APP_STRINGS } from '@patacerca/core';
import { useWalkerData } from '../../../providers/DataProvider';

export const PhoneScreen: React.FC = () => {
  const router = useRouter();
  const { authRepository } = useWalkerData();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const cleaned = cleanBolivianPhone(phone);
    if (!isValidBolivianPhone(cleaned)) {
      setError(APP_STRINGS.errors.invalidBolivianPhone);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authRepository.sendOtp(cleaned);
      router.push({
        pathname: '/(auth)/code',
        params: { phone: cleaned },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/welcome');
    }
  };

  return (
    <FormScreenLayout
      footer={
        <Button
          title="Enviar código"
          onPress={handleSubmit}
          loading={loading}
          size="lg"
        />
      }
    >
      <View style={styles.header}>
        <IconButton icon="back" onPress={handleBack} />
      </View>

      <Text style={styles.title}>¿Cuál es tu WhatsApp?</Text>
      <Text style={styles.subtitle}>
        Por aquí te llegarán las solicitudes de los dueños.
      </Text>

      <View style={styles.inputWrapper}>
        <PhoneInput
          value={phone}
          onChangeText={(val) => {
            setPhone(val);
            if (error) setError('');
          }}
          error={error}
          autoFocus
        />
      </View>
    </FormScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.9,
    color: '#2A2420',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#6B6058',
    marginBottom: 28,
  },
  inputWrapper: {
    width: '100%',
  },
});
