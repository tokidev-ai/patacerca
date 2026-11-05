import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Button,
  Input,
  Field,
  FormScreenLayout,
  SearchableOptionSelect,
} from '@patacerca/ui';
import { COCHABAMBA_ZONES, DEFAULT_ZONE, Walker, APP_STRINGS } from '@patacerca/core';
import { useWalkerData } from '../../../providers/DataProvider';
import { useWalkerSessionStore } from '../../../store/session.store';

export const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { profileRepository, walkersRepository } = useWalkerData();
  const { setSession } = useWalkerSessionStore();

  const [name, setName] = useState('');
  const [zone, setZone] = useState<string>(DEFAULT_ZONE);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      setError(APP_STRINGS.errors.missingWalkerFields);
      return;
    }
    setError('');
    setLoading(true);

    const userPhone = phone || '71110001';
    const newWalker: Walker = {
      id: `w_${Date.now()}`,
      phone: userPhone,
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
      await profileRepository.saveWalkerProfile(newWalker);
      await walkersRepository
        .updateWalkerProfile(newWalker.id, newWalker)
        .catch(() => {});
      setSession(userPhone, newWalker);
      router.replace('/verification');
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

      <Field label="Nombre completo" error={error}>
        <Input
          placeholder="Como aparece en tu carnet"
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (error) setError('');
          }}
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
