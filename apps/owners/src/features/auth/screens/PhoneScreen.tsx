import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, IconButton, PhoneInput, FormScreenLayout } from '@patacerca/ui';
import { isValidBolivianPhone, cleanBolivianPhone, APP_STRINGS } from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';

export const PhoneScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { authRepository, profileRepository } = useData();
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
      // El login ahora es con correo y contraseña; este flujo solo registra.
      const existingOwner = await profileRepository.getOwnerProfile(cleaned);
      if (existingOwner) {
        setError(APP_STRINGS.errors.phoneAlreadyRegistered);
        return;
      }

      await authRepository.sendOtp(cleaned);
      router.push({
        pathname: '/(auth)/code',
        params: { phone: cleaned },
      });
    } catch {
      setError(APP_STRINGS.errors.authFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <FormScreenLayout
      horizontalPadding={0}
      edgeToEdgeTop
      footer={
        <View style={styles.footerPad}>
          <Button title="Continuar" onPress={handleSubmit} loading={loading} size="lg" />
        </View>
      }
    >
      <StatusBar style="dark" />
      <Image
        source={require('../../../../assets/duenos-welcome.jpg')}
        style={styles.hero}
        resizeMode="cover"
      />
      <View style={[styles.backWrap, { top: insets.top + 12 }]}>
        <IconButton icon="back" onPress={handleBack} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.title}>¿Cuál es tu WhatsApp?</Text>
        <Text style={styles.subtitle}>
          Verificamos tu número con un código y luego creas tu correo y contraseña.
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
      </View>
    </FormScreenLayout>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    height: 240,
  },
  backWrap: {
    position: 'absolute',
    left: 24,
  },
  panel: {
    flexGrow: 1,
    marginTop: -32,
    paddingHorizontal: 24,
    paddingTop: 28,
    backgroundColor: '#F7F2EA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
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
  footerPad: {
    paddingHorizontal: 24,
  },
});
