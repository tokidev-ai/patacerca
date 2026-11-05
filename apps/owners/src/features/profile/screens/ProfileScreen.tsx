import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Avatar, Button, PetAddModal, PetDetailModal, AppIcon } from '@patacerca/ui';
import { Pet, PetSize } from '@patacerca/core';
import { useData } from '../../../providers/DataProvider';
import { useSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';

const DEFAULT_PET_IMAGE = require('../../../../assets/duenos-perfil-perro.jpg');

function petSizeLabel(size: PetSize): string {
  if (size === 'small') return 'Pequeño';
  if (size === 'large') return 'Grande';
  return 'Mediano';
}

function getPetImageSource(pet: Pet): ImageSourcePropType {
  if (pet.photoUrl) {
    return { uri: pet.photoUrl };
  }
  return DEFAULT_PET_IMAGE;
}

export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { authRepository, profileRepository } = useData();
  const { owner, phone, clearSession, setSession } = useSessionStore();
  const { showToast } = useToastStore();

  const [addPetVisible, setAddPetVisible] = useState(false);
  const [editPetVisible, setEditPetVisible] = useState(false);
  const [detailPet, setDetailPet] = useState<Pet | null>(null);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  const handleLogout = async () => {
    await authRepository.logout();
    clearSession();
    router.replace('/(auth)/welcome');
  };

  const persistOwner = (updated: NonNullable<typeof owner>) => {
    if (!phone) return;
    setSession(phone, updated);
  };

  const handleAddPet = async (petData: {
    name: string;
    size: PetSize;
    breed?: string;
    photoUrl?: string;
  }) => {
    if (!phone) return;
    const newPet: Pet = {
      id: `pet_${Date.now()}`,
      ...petData,
    };
    try {
      const updated = await profileRepository.addPetToOwner(phone, newPet);
      persistOwner(updated);
      showToast(`¡${newPet.name} agregado a tus mascotas!`);
    } catch {
      showToast('Error al agregar mascota');
    }
  };

  const handleUpdatePet = async (
    petId: string,
    petData: {
      name: string;
      size: PetSize;
      breed?: string;
      photoUrl?: string;
    }
  ) => {
    if (!phone) return;
    try {
      const updated = await profileRepository.updatePetOnOwner(phone, petId, petData);
      persistOwner(updated);
      showToast('Mascota actualizada');
      setDetailPet(null);
    } catch {
      showToast('Error al actualizar mascota');
    }
  };

  const confirmDeletePet = (pet: Pet) => {
    Alert.alert(
      `Eliminar a ${pet.name}`,
      'Esta mascota dejará de aparecer en tu perfil. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => void handleDeletePet(pet),
        },
      ]
    );
  };

  const handleDeletePet = async (pet: Pet) => {
    if (!phone) return;
    const list = owner?.pets?.length ? owner.pets : [];
    if (list.length <= 1 && pet.id !== 'default') {
      showToast('Debes tener al menos una mascota en tu perfil');
      return;
    }
    if (pet.id === 'default') {
      showToast('Agrega otra mascota antes de eliminar la principal');
      return;
    }
    try {
      const updated = await profileRepository.removePetFromOwner(phone, pet.id);
      persistOwner(updated);
      showToast(`${pet.name} eliminado del perfil`);
      setDetailPet(null);
    } catch {
      showToast('Error al eliminar mascota');
    }
  };

  const pets: Pet[] =
    owner?.pets && owner.pets.length > 0
      ? owner.pets
      : [
          {
            id: 'default',
            name: owner?.dogName || 'Mi perro',
            size: owner?.dogSize || 'medium',
          },
        ];

  const openPetDetail = (pet: Pet) => {
    setDetailPet(pet);
  };

  const openPetEdit = (pet: Pet) => {
    setDetailPet(null);
    setEditingPet(pet);
    setEditPetVisible(true);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.profileCard}>
          <Avatar name={owner?.name || 'Dueño'} colorName="green" size={64} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{owner?.name || 'Dueño'}</Text>
            <Text style={styles.meta}>
              +591 {phone || '70000000'} · {owner?.zone || 'Cochabamba'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Mis mascotas</Text>
            <Text style={styles.sectionSubtitle}>
              {pets.length} {pets.length === 1 ? 'mascota' : 'mascotas'} · toca una para
              ver detalles
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setAddPetVisible(true)}
            style={styles.addPetButton}
          >
            <Text style={styles.addPetText}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.petsList}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              activeOpacity={0.75}
              onPress={() => openPetDetail(pet)}
              style={styles.petRow}
            >
              <Image
                source={getPetImageSource(pet)}
                style={styles.petThumb}
                resizeMode="cover"
              />
              <View style={styles.petRowBody}>
                <Text style={styles.petEyebrow}>Mascota</Text>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petSize} numberOfLines={2}>
                  Tamaño: {petSizeLabel(pet.size)}
                  {pet.breed ? ` · ${pet.breed}` : ''}
                </Text>
              </View>
              <AppIcon name="chevron-right" size={20} color="#8A7D70" />
            </TouchableOpacity>
          ))}
        </View>

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
        mode="create"
        onClose={() => setAddPetVisible(false)}
        onAddPet={handleAddPet}
      />

      <PetAddModal
        visible={editPetVisible}
        mode="edit"
        initialPet={editingPet}
        onClose={() => {
          setEditPetVisible(false);
          setEditingPet(null);
        }}
        onAddPet={handleAddPet}
        onUpdatePet={handleUpdatePet}
      />

      <PetDetailModal
        visible={Boolean(detailPet)}
        pet={detailPet}
        defaultImageSource={DEFAULT_PET_IMAGE}
        onClose={() => setDetailPet(null)}
        onEdit={openPetEdit}
        onDelete={confirmDeletePet}
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
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
  },
  sectionSubtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginTop: 2,
    maxWidth: 220,
    lineHeight: 18,
  },
  addPetButton: {
    backgroundColor: '#E4EFE6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
    flexShrink: 0,
  },
  addPetText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#2F6E48',
  },
  petsList: {
    gap: 10,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 18,
    padding: 10,
    gap: 12,
  },
  petThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#E6DCCD',
  },
  petRowBody: {
    flex: 1,
    minWidth: 0,
  },
  petEyebrow: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 12,
    color: '#3E8E5E',
    marginBottom: 2,
  },
  petName: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 17,
    color: '#2A2420',
  },
  petSize: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginTop: 2,
    lineHeight: 18,
  },
  logoutWrapper: {
    marginTop: 24,
  },
});
