import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Field, Input, FormScreenLayout, useKeyboardHeight } from '@patacerca/ui';
import {
  APP_STRINGS,
  isValidEmail,
  normalizeEmail,
  shouldUseMockData,
} from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';

interface LoginErrors {
  email?: string;
  password?: string;
}

export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Con el teclado abierto se oculta la imagen para que los campos queden visibles.
  const keyboardOpen = useKeyboardHeight() > 0;
  const { authRepository, profileRepository } = useData();
  const { setSession } = useSessionStore();
  const { showToast } = useToastStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { blocked } = useLocalSearchParams<{ blocked?: string }>();
  const [errors, setErrors] = useState<LoginErrors>(() =>
    blocked === '1' ? { password: APP_STRINGS.errors.accountBlocked } : {}
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const normalizedEmail = normalizeEmail(email);
    const next: LoginErrors = {};
    if (!isValidEmail(normalizedEmail)) next.email = APP_STRINGS.errors.invalidEmail;
    if (!password) next.password = APP_STRINGS.errors.missingPassword;
    if (next.email || next.password) {
      setErrors(next);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const phone = await authRepository.loginWithEmail(
        normalizedEmail,
        password,
        'owner'
      );
      const owner = phone ? await profileRepository.getOwnerProfile(phone) : null;
      if (!phone || !owner) {
        setErrors({ password: APP_STRINGS.errors.invalidCredentials });
        return;
      }
      if (owner.blocked) {
        await authRepository.logout();
        setErrors({ password: APP_STRINGS.errors.accountBlocked });
        return;
      }

      await authRepository.saveSession({ phone, role: 'owner', ownerData: owner });
      setSession(phone, owner);
      showToast(APP_STRINGS.toasts.welcomeBack(owner.name));
      router.replace('/(tabs)/search');
    } catch (e) {
      console.warn('[login] falló:', e);
      const detail = __DEV__ && e instanceof Error ? ` (${e.message})` : '';
      setErrors({ password: `${APP_STRINGS.errors.authFailed}${detail}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormScreenLayout horizontalPadding={0} edgeToEdgeTop>
      <StatusBar style="dark" />
      {!keyboardOpen && (
        <Image
          source={require('../../../../assets/duenos-welcome.jpg')}
          style={styles.hero}
          resizeMode="cover"
        />
      )}

      <View
        style={[
          styles.panel,
          keyboardOpen && {
            marginTop: 0,
            paddingTop: insets.top + 20,
            borderRadius: 0,
          },
        ]}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoDot} />
          <Text style={styles.logoTitle}>patacerca</Text>
        </View>

        <Text style={styles.title}>Inicia sesión</Text>
        <Text style={styles.subtitle}>
          Entra con tu correo para encontrar paseadores verificados en tu barrio.
        </Text>

        <Field label="Correo">
          <Input
            placeholder="tu@correo.com"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            error={errors.email}
          />
        </Field>

        <Field label="Contraseña">
          <Input
            placeholder="Tu contraseña"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            error={errors.password}
          />
        </Field>

        <View style={styles.buttonWrapper}>
          <Button title="Ingresar" onPress={handleSubmit} loading={loading} size="lg" />
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿No tienes cuenta?</Text>
          <Pressable onPress={() => router.push('/(auth)/phone')} hitSlop={8}>
            <Text style={styles.registerLink}>Regístrate</Text>
          </Pressable>
        </View>

        {shouldUseMockData() ? (
          <Text style={styles.hint}>Demo: daniela@patacerca.test · 123456</Text>
        ) : null}
      </View>
    </FormScreenLayout>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    height: 300,
  },
  panel: {
    flexGrow: 1,
    marginTop: -32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    backgroundColor: '#F7F2EA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3E8E5E',
  },
  logoTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
    letterSpacing: -0.4,
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
    marginBottom: 24,
  },
  buttonWrapper: {
    marginTop: 8,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  registerText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    color: '#6B6058',
  },
  registerLink: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#3E8E5E',
  },
  hint: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#8A7D70',
    marginTop: 16,
    textAlign: 'center',
  },
});
