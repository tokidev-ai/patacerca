import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  AvatarPicker,
  Button,
  Input,
  Chip,
  Field,
  FormScreenLayout,
  SearchableOptionSelect,
} from '@patacerca/ui';
import {
  DEFAULT_ZONE,
  MIN_PASSWORD_LENGTH,
  PetSize,
  Owner,
  APP_STRINGS,
  isEmailTakenError,
  isValidEmail,
  normalizeEmail,
} from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';
import { useZones } from '../../../hooks/useZones';

type FieldErrors = Partial<
  Record<'name' | 'dogName' | 'email' | 'password' | 'confirmPassword', string>
>;

export const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const zoneOptions = useZones();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { authRepository, profileRepository } = useData();
  const { setSession } = useSessionStore();
  const { showToast } = useToastStore();

  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [zone, setZone] = useState<string>(DEFAULT_ZONE);
  const [dogName, setDogName] = useState('');
  const [dogSize, setDogSize] = useState<PetSize>('medium');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const clearError = (key: keyof FieldErrors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const handleSubmit = async () => {
    const normalizedEmail = normalizeEmail(email);
    const next: FieldErrors = {};
    if (!name.trim()) next.name = APP_STRINGS.errors.missingOwnerFields;
    if (!dogName.trim()) next.dogName = APP_STRINGS.errors.missingOwnerFields;
    if (!isValidEmail(normalizedEmail)) next.email = APP_STRINGS.errors.invalidEmail;
    if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = APP_STRINGS.errors.passwordTooShort;
    } else if (confirmPassword !== password) {
      next.confirmPassword = APP_STRINGS.errors.passwordMismatch;
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);

    const userPhone = phone || '70000000';
    const newOwner: Owner = {
      phone: userPhone,
      email: normalizedEmail,
      photoUrl: photoUri ?? undefined,
      name: name.trim(),
      zone,
      dogName: dogName.trim(),
      dogSize,
      pets: [
        {
          id: `pet_${Date.now()}`,
          name: dogName.trim(),
          size: dogSize,
        },
      ],
      createdAt: Date.now(),
    };

    try {
      await authRepository.registerCredentials({
        email: normalizedEmail,
        password,
        phone: userPhone,
        role: 'owner',
      });
      const saved = await profileRepository.saveOwnerProfile(newOwner);
      setSession(userPhone, saved);
      showToast(`¡Bienvenido a Patacerca, ${newOwner.name}!`);
      router.replace('/(tabs)/search');
    } catch (e) {
      console.warn('[registro] falló:', e);
      const detail = __DEV__ && e instanceof Error ? ` (${e.message})` : '';
      setErrors({
        email: isEmailTakenError(e)
          ? APP_STRINGS.errors.emailAlreadyRegistered
          : `${APP_STRINGS.errors.authFailed}${detail}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormScreenLayout
      footer={
        <Button title="Crear cuenta" onPress={handleSubmit} loading={loading} size="lg" />
      }
    >
      <Text style={styles.eyebrow}>Crea tu cuenta</Text>
      <Text style={styles.title}>Cuéntanos de ti y tu perro</Text>

      <View style={styles.photoSection}>
        <AvatarPicker
          name={name || 'Tú'}
          uri={photoUri}
          loading={loading}
          onChange={setPhotoUri}
          label="Tu foto (opcional)"
          hint="Los paseadores verán tu foto en tu perfil."
        />
      </View>

      <Field label="Tu nombre" error={errors.name}>
        <Input
          placeholder="Nombre y apellido"
          value={name}
          onChangeText={(val) => {
            setName(val);
            clearError('name');
          }}
        />
      </Field>

      <Field label="Correo" error={errors.email}>
        <Input
          placeholder="tu@correo.com"
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            clearError('email');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />
      </Field>

      <Field label="Contraseña" error={errors.password}>
        <Input
          placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            clearError('password');
          }}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </Field>

      <Field label="Repite tu contraseña" error={errors.confirmPassword}>
        <Input
          placeholder="Repite la contraseña"
          value={confirmPassword}
          onChangeText={(val) => {
            setConfirmPassword(val);
            clearError('confirmPassword');
          }}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </Field>

      <View style={styles.fieldSection}>
        <Text style={styles.fieldHint}>Tu zona en Cochabamba</Text>
        <SearchableOptionSelect
          label="Barrio"
          options={zoneOptions}
          value={zone}
          onChange={setZone}
          searchPlaceholder="Buscar barrio…"
          sheetTitle="Busca y elige tu barrio"
        />
      </View>

      <Field label="¿Cómo se llama tu perro?" error={errors.dogName}>
        <Input
          placeholder="Ej. Toby"
          value={dogName}
          onChangeText={(val) => {
            setDogName(val);
            clearError('dogName');
          }}
        />
      </Field>

      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Tamaño del perro</Text>
        <View style={styles.sizeChipsRow}>
          <Chip
            label="Pequeño"
            selected={dogSize === 'small'}
            onPress={() => setDogSize('small')}
          />
          <Chip
            label="Mediano"
            selected={dogSize === 'medium'}
            onPress={() => setDogSize('medium')}
          />
          <Chip
            label="Grande"
            selected={dogSize === 'large'}
            onPress={() => setDogSize('large')}
          />
        </View>
      </View>
    </FormScreenLayout>
  );
};

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: '#3E8E5E',
    marginBottom: 4,
    marginTop: 24,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.9,
    color: '#2A2420',
    marginBottom: 24,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  fieldSection: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
    marginBottom: 4,
  },
  fieldHint: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginBottom: 10,
    lineHeight: 18,
  },
  sizeChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
