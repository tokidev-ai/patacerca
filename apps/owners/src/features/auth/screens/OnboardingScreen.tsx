import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Button,
  Input,
  Chip,
  Field,
  FormScreenLayout,
  SearchableOptionList,
} from '@patacerca/ui';
import {
  COCHABAMBA_ZONES,
  DEFAULT_ZONE,
  PetSize,
  Owner,
  APP_STRINGS,
} from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';

export const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { profileRepository } = useData();
  const { setSession } = useSessionStore();
  const { showToast } = useToastStore();

  const [name, setName] = useState('');
  const [zone, setZone] = useState<string>(DEFAULT_ZONE);
  const [dogName, setDogName] = useState('');
  const [dogSize, setDogSize] = useState<PetSize>('medium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !dogName.trim()) {
      setError(APP_STRINGS.errors.missingOwnerFields);
      return;
    }
    setError('');
    setLoading(true);

    const userPhone = phone || '70000000';
    const newOwner: Owner = {
      phone: userPhone,
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
      await profileRepository.saveOwnerProfile(newOwner);
      setSession(userPhone, newOwner);
      showToast(`¡Bienvenido a Patacerca, ${newOwner.name}!`);
      router.replace('/(tabs)/search');
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

      <Field label="Tu nombre" error={error && !name.trim() ? error : undefined}>
        <Input
          placeholder="Nombre y apellido"
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (error) setError('');
          }}
        />
      </Field>

      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Tu zona en Cochabamba</Text>
        <Text style={styles.fieldHint}>Busca y elige tu barrio</Text>
        <SearchableOptionList
          options={COCHABAMBA_ZONES}
          value={zone}
          onChange={setZone}
          searchPlaceholder="Buscar barrio…"
          maxListHeight={200}
        />
      </View>

      <Field
        label="¿Cómo se llama tu perro?"
        error={error && !dogName.trim() ? error : undefined}
      >
        <Input
          placeholder="Ej. Toby"
          value={dogName}
          onChangeText={(val) => {
            setDogName(val);
            if (error) setError('');
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
