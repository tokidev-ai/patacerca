import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, IconButton, OtpInput } from '@patacerca/ui';
import { APP_STRINGS } from '@patacerca/core';
import { useWalkerData } from '../../../providers/DataProvider';
import { useWalkerSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';

export const CodeScreen: React.FC = () => {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { profileRepository } = useWalkerData();
  const { setSession } = useWalkerSessionStore();
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
      const userPhone = phone || '71110001';
      const existingWalker = await profileRepository.getWalkerProfile(userPhone);

      if (existingWalker) {
        setSession(userPhone, existingWalker);
        showToast(APP_STRINGS.toasts.welcomeBack(existingWalker.name));
        router.replace('/(tabs)/requests');
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <IconButton icon="back" onPress={() => router.back()} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Ingresa el código</Text>
          <Text style={styles.subtitle}>
            Lo enviamos por WhatsApp al +591 {phone}.
          </Text>

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
        </View>

        <View style={styles.bottomBar}>
          <Button
            title="Verificar"
            onPress={handleVerify}
            loading={loading}
            size="lg"
          />
        </View>
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
    alignItems: 'center',
  },
  hint: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#8A7D70',
    marginTop: 12,
    textAlign: 'center',
  },
  bottomBar: {
    paddingVertical: 24,
  },
});

