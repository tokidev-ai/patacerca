import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, IconButton, OtpInput, FormScreenLayout } from '@patacerca/ui';
import {
  APP_STRINGS,
  cleanBolivianPhone,
  isRealSmsEnabled,
  otpSendErrorMessage,
  otpVerifyErrorMessage,
} from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';

const RESEND_SECONDS = 60;

export const CodeScreen: React.FC = () => {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { authRepository } = useData();
  const { setSession } = useSessionStore();
  const { showToast } = useToastStore();

  const realSms = isRealSmsEnabled();
  const codeLength = realSms ? 6 : 4;
  const userPhone = cleanBolivianPhone(phone || '');

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const handleVerify = async () => {
    if (!userPhone) {
      setError(APP_STRINGS.errors.invalidBolivianPhone);
      return;
    }
    if (code.trim().length < codeLength) {
      setError(APP_STRINGS.errors.invalidOtp);
      return;
    }
    setError('');
    setLoading(true);

    try {
      const result = await authRepository.verifyOtp(userPhone, code.trim(), 'owner');

      if (result.exists && result.user?.ownerData) {
        const owner = result.user.ownerData;
        if (owner.blocked) {
          await authRepository.logout();
          setError(APP_STRINGS.errors.accountBlocked);
          return;
        }
        setSession(userPhone, owner);
        showToast(APP_STRINGS.toasts.welcomeBack(owner.name));
        router.replace('/(tabs)/search');
        return;
      }

      if (result.otpValid) {
        router.push({
          pathname: '/(auth)/onboarding',
          params: { phone: userPhone },
        });
        return;
      }

      setError(otpVerifyErrorMessage(result));
    } catch {
      setError(APP_STRINGS.errors.authFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await authRepository.sendOtp(userPhone);
      setCode('');
      setSecondsLeft(RESEND_SECONDS);
      showToast('Te enviamos un nuevo código');
    } catch (e) {
      setError(otpSendErrorMessage(e));
    } finally {
      setResending(false);
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
      <Text style={styles.subtitle}>
        {realSms
          ? `Te enviamos un SMS con un código de ${codeLength} dígitos al +591 ${userPhone}.`
          : `Ingresa el código de verificación para +591 ${userPhone}.`}
      </Text>

      <View style={styles.inputWrapper}>
        <OtpInput
          value={code}
          length={codeLength}
          onChangeText={(val) => {
            setCode(val);
            if (error) setError('');
          }}
          error={error}
          autoFocus
        />
        {!realSms && <Text style={styles.hint}>Código de prueba: 1234</Text>}

        {realSms && (
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={secondsLeft > 0 || resending}
            onPress={handleResend}
            style={styles.resendButton}
          >
            <Text style={[styles.resendText, secondsLeft > 0 && styles.resendDisabled]}>
              {resending
                ? 'Enviando…'
                : secondsLeft > 0
                  ? `Reenviar código en ${secondsLeft} s`
                  : 'Reenviar código'}
            </Text>
          </TouchableOpacity>
        )}
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
  resendButton: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  resendText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2F6E48',
    textAlign: 'center',
  },
  resendDisabled: {
    color: '#8A7D70',
  },
});
