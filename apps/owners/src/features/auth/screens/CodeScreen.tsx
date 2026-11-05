import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, IconButton, OtpInput, FormScreenLayout } from '@patacerca/ui';
import { APP_STRINGS } from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';

export const CodeScreen: React.FC = () => {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { profileRepository } = useData();
  const { setSession } = useSessionStore();
  const { showToast } = useToastStore();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code !== '1234') {
      setError(APP_STRINGS.errors.invalidOtp);
      return;
    }
    setError('');
    setLoading(true);

    try {
      const userPhone = phone || '70000000';
      const existingOwner = await profileRepository.getOwnerProfile(userPhone);

      if (existingOwner) {
        setSession(userPhone, existingOwner);
        showToast(APP_STRINGS.toasts.welcomeBack(existingOwner.name));
        router.replace('/(tabs)/search');
      } else {
        router.push({
          pathname: '/(auth)/onboarding',
          params: { phone: userPhone },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/phone');
    }
  };

  return (
    <FormScreenLayout
      footer={
        <Button title="Verificar" onPress={handleVerify} loading={loading} size="lg" />
      }
    >
      <View style={styles.header}>
        <IconButton icon="back" onPress={handleBack} />
      </View>

      <Text style={styles.title}>Ingresa el código</Text>
      <Text style={styles.subtitle}>Lo enviamos por WhatsApp al +591 {phone}.</Text>

      <View style={styles.inputWrapper}>
        <OtpInput
          value={code}
          onChangeText={(val) => {
            setCode(val);
            if (error) setError('');
          }}
          error={error}
          autoFocus
        />
        <Text style={styles.hint}>Código de prueba: 1234</Text>
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
    alignItems: 'center',
  },
  hint: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#8A7D70',
    marginTop: 12,
    textAlign: 'center',
  },
});
