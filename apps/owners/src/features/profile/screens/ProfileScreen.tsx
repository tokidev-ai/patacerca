import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, PetAddModal } from '@patacerca/ui';
import { PetSize } from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';

export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { authRepository, profileRepository } = useData();
  const { owner, phone, clearSession, setSession } = useSessionStore();
  const { showToast } = useToastStore();

  const [addPetVisible, setAddPetVisible] = useState(false);

  const handleLogout = async () => {
    await authRepository.logout();
    clearSession();
    router.replace('/(auth)/welcome');
  };

  const handleAddPet = async (petData: {
    name: string;
    size: PetSize;
    breed?: string;
  }) => {
    if (!phone) return;
    const newPet = {
      id: `pet_${Date.now()}`,
      ...petData,
    };
    try {
      const updated = await profileRepository.addPetToOwner(phone, newPet);
      setSession(phone, updated);
      showToast(`¡${newPet.name} agregado a tus mascotas!`);
    } catch {
      showToast('Error al agregar mascota');
    }
  };

  const pets = owner?.pets && owner.pets.length > 0
    ? owner.pets
    : [
        {
          id: 'default',
          name: owner?.dogName || 'Mi perro',
          size: owner?.dogSize || ('medium' as PetSize),
        },
      ];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Perfil</Text>

        {/* User Card */}
        <View style={styles.profileCard}>
          <Avatar
            name={owner?.name || 'Dueño'}
            colorName="green"
            size={64}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{owner?.name || 'Dueño'}</Text>
            <Text style={styles.meta}>
              +591 {phone || '70000000'} · {owner?.zone || 'Cochabamba'}
            </Text>
          </View>
        </View>

        {/* Pets Header & Add button (from meeting) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis mascotas</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setAddPetVisible(true)}
            style={styles.addPetButton}
          >
            <Text style={styles.addPetText}>+ Agregar mascota</Text>
          </TouchableOpacity>
        </View>

        {/* Pets Cards */}
        {pets.map((pet, idx) => (
          <Card key={pet.id} style={styles.petCard}>
            {idx === 0 && (
              <Image
                source={require('../../../../assets/duenos-perfil-perro.jpg')}
                style={styles.petImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.petCardContent}>
              <Text style={styles.petEyebrow}>Mascota</Text>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petSize}>
                Tamaño:{' '}
                {pet.size === 'small'
                  ? 'Pequeño'
                  : pet.size === 'large'
                  ? 'Grande'
                  : 'Mediano'}
                {pet.breed ? ` · ${pet.breed}` : ''}
              </Text>
            </View>
          </Card>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutWrapper}>
          <Button
            title="Cerrar sesión"
            variant="danger-soft"
            onPress={handleLogout}
            size="md"
          />
        </View>
      </ScrollView>

      <PetAddModal
        visible={addPetVisible}
        onClose={() => setAddPetVisible(false)}
        onAddPet={handleAddPet}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F2EA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
    color: '#2A2420',
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  name: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 18,
    color: '#2A2420',
  },
  meta: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#6B6058',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
  },
  addPetButton: {
    backgroundColor: '#E4EFE6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  addPetText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#2F6E48',
  },
  petCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  petImage: {
    width: '100%',
    height: 150,
  },
  petCardContent: {
    padding: 16,
  },
  petEyebrow: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#3E8E5E',
    marginBottom: 2,
  },
  petName: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 18,
    color: '#2A2420',
  },
  petSize: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#6B6058',
    marginTop: 2,
  },
  logoutWrapper: {
    marginTop: 24,
  },
});

