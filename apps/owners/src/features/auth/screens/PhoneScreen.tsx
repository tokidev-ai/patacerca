import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, IconButton, PhoneInput } from '@patacerca/ui';
import { isValidBolivianPhone, cleanBolivianPhone, APP_STRINGS } from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';

export const PhoneScreen: React.FC = () => {
  const router = useRouter();
  const { authRepository } = useData();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <IconButton icon="back" onPress={() => router.back()} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>¿Cuál es tu WhatsApp?</Text>
            <Text style={styles.subtitle}>
              Te enviaremos un código para ingresar o crear tu cuenta.
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

          <View style={styles.bottomBar}>
            <Button
              title="Enviar código"
              onPress={handleSubmit}
              loading={loading}
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F2EA',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 12,
    marginBottom: 20,
  },
  content: {
    flex: 1,
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
  bottomBar: {
    paddingVertical: 24,
  },
});

