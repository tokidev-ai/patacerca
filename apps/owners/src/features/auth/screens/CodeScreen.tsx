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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, IconButton, OtpInput } from '@patacerca/ui';
import { APP_STRINGS } from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';

export const CodeScreen: React.FC = () => {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { authRepository, profileRepository } = useData();
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

