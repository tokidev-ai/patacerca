import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, Input, Chip, Field } from '@patacerca/ui';
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalChips}
            >
              {COCHABAMBA_ZONES.map((z) => (
                <Chip
                  key={z}
                  label={z}
                  selected={zone === z}
                  onPress={() => setZone(z)}
                />
              ))}
            </ScrollView>
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
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            title="Crear cuenta"
            onPress={handleSubmit}
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
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  eyebrow: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: '#3E8E5E',
    marginBottom: 4,
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
    marginBottom: 8,
  },
  horizontalChips: {
    gap: 8,
    paddingVertical: 2,
  },
  sizeChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomBar: {
    paddingVertical: 20,
  },
});

