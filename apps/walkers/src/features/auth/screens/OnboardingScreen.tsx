import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  AvatarPicker,
  Button,
  Input,
  Field,
  FormScreenLayout,
  SearchableOptionSelect,
} from '@patacerca/ui';
import {
  COCHABAMBA_ZONES,
  DEFAULT_ZONE,
  MIN_PASSWORD_LENGTH,
  Walker,
  APP_STRINGS,
  isEmailTakenError,
  isValidEmail,
  normalizeEmail,
} from '@patacerca/core';
import { useWalkerData } from '../../../providers/DataProvider';
import { useWalkerSessionStore } from '../../../store/session.store';

type FieldErrors = Partial<
  Record<'photo' | 'name' | 'email' | 'password' | 'confirmPassword', string>
>;

export const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { authRepository, profileRepository, walkersRepository } = useWalkerData();
  const { setSession } = useWalkerSessionStore();

  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [zone, setZone] = useState<string>(DEFAULT_ZONE);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const clearError = (key: keyof FieldErrors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const handleSubmit = async () => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const normalizedEmail = normalizeEmail(email);
    const next: FieldErrors = {};
    if (!photoUri) next.photo = APP_STRINGS.errors.missingWalkerPhoto;
    if (parts.length < 2) next.name = APP_STRINGS.errors.missingWalkerFields;
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

    const userPhone = phone || '71110001';
    const newWalker: Walker = {
      id: `w_${Date.now()}`,
      phone: userPhone,
      email: normalizedEmail,
      photoUrl: photoUri ?? undefined,
      name: name.trim(),
      zone,
      distanceText: 'a pocas cuadras',
      rating: 5.0,
      reviewsCount: 0,
      price30: 20,
      price60: 32,
      availableToday: true,
      acceptsLargeDogs: true,
      travelCare: false,
      colorName: 'green',
      bio: '',
      reviews: [],
      status: 'pending',
      zones: [zone],
      days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
      timeSlots: ['Tarde'],
    };

    try {
      await authRepository.registerCredentials({
        email: normalizedEmail,
        password,
        phone: userPhone,
        role: 'walker',
      });
      const saved = await profileRepository.saveWalkerProfile(newWalker);
      await walkersRepository.updateWalkerProfile(saved.id, saved).catch(() => {});
      setSession(userPhone, saved);
      router.replace('/verification');
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
        <Button title="Continuar" onPress={handleSubmit} loading={loading} size="lg" />
      }
    >
      <Text style={styles.eyebrow}>Crea tu cuenta</Text>
      <Text style={styles.title}>Empecemos por lo básico</Text>

      <View style={styles.photoSection}>
        <AvatarPicker
          name={name || 'Tú'}
          uri={photoUri}
          loading={loading}
          onChange={(uri) => {
            setPhotoUri(uri);
            clearError('photo');
          }}
          label="Foto de perfil"
          hint="De frente y con buena luz. Es la foto que verán los dueños arriba de tu perfil."
          error={errors.photo}
        />
      </View>

      <Field label="Nombre completo" error={errors.name}>
        <Input
          placeholder="Como aparece en tu carnet"
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
        <Text style={styles.fieldHint}>Zona donde vives</Text>
        <SearchableOptionSelect
          label="Barrio"
          options={COCHABAMBA_ZONES}
          value={zone}
          onChange={setZone}
          searchPlaceholder="Buscar barrio…"
          sheetTitle="Elige tu barrio"
        />
      </View>

      <View style={styles.sandNote}>
        <Text style={styles.sandNoteText}>
          <Text style={styles.sandNoteBold}>Siguiente paso:</Text> verificar tu identidad.
          Los dueños solo ven paseadores verificados.
        </Text>
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
  sandNote: {
    backgroundColor: '#EFE6D8',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sandNoteText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#4A413A',
  },
  sandNoteBold: {
    fontFamily: 'Figtree_600SemiBold',
    color: '#2A2420',
  },
});
