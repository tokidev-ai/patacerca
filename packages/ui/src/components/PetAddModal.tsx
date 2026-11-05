import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { Pet, PetSize } from '@patacerca/core';
import { Input } from './Input';
import { Chip } from './Chip';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { AppIcon } from './AppIcon';
import { keyboardAvoidingBehavior } from '../keyboard';
import { KeyboardAwareScrollView } from '../keyboard-aware-scroll';

export interface PetAddModalProps {
  visible: boolean;
  mode?: 'create' | 'edit';
  initialPet?: Pet | null;
  onClose: () => void;
  onAddPet: (pet: {
    name: string;
    size: PetSize;
    breed?: string;
    photoUrl?: string;
  }) => void;
  onUpdatePet?: (
    petId: string,
    pet: {
      name: string;
      size: PetSize;
      breed?: string;
      photoUrl?: string;
    }
  ) => void;
}

type PetAddModalFormProps = Omit<PetAddModalProps, 'visible'>;

const PetAddModalForm: React.FC<PetAddModalFormProps> = ({
  mode = 'create',
  initialPet,
  onClose,
  onAddPet,
  onUpdatePet,
}) => {
  const isEdit = mode === 'edit' && initialPet;

  const [name, setName] = useState(() => (isEdit && initialPet ? initialPet.name : ''));
  const [size, setSize] = useState<PetSize>(() =>
    isEdit && initialPet ? initialPet.size : 'medium'
  );
  const [breed, setBreed] = useState(() =>
    isEdit && initialPet ? initialPet.breed || '' : ''
  );
  const [photoUri, setPhotoUri] = useState<string | null>(() =>
    isEdit && initialPet ? initialPet.photoUrl || null : null
  );
  const [error, setError] = useState('');

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Fotos',
        'Activa el acceso a la galería para subir la foto de tu mascota.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cámara', 'Activa la cámara para tomar la foto de tu mascota.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePickPhoto = () => {
    Alert.alert('Foto de tu mascota', 'Elige una opción', [
      { text: 'Galería', onPress: () => void pickFromLibrary() },
      { text: 'Cámara', onPress: () => void pickFromCamera() },
      ...(photoUri
        ? [
            {
              text: 'Quitar foto',
              style: 'destructive' as const,
              onPress: () => setPhotoUri(null),
            },
          ]
        : []),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Escribe el nombre de tu perrito');
      return;
    }
    const payload = {
      name: name.trim(),
      size,
      breed: breed.trim() || undefined,
      photoUrl: photoUri || undefined,
    };
    if (isEdit && initialPet && onUpdatePet) {
      onUpdatePet(initialPet.id, payload);
    } else {
      onAddPet(payload);
    }
    onClose();
  };

  return (
    <KeyboardAvoidingView behavior={keyboardAvoidingBehavior} style={styles.keyboardWrap}>
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              {isEdit ? 'Editar mascota' : 'Nueva mascota'}
            </Text>
            <Text style={styles.title}>
              {isEdit ? initialPet!.name : 'Agregar perrito'}
            </Text>
          </View>
          <IconButton icon="close" size={36} onPress={onClose} />
        </View>

        <KeyboardAwareScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.formScrollContent}
          extraBottomInset={96}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Foto (opcional)</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePickPhoto}
            style={styles.photoPicker}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <View style={styles.photoIconCircle}>
                  <AppIcon name="camera" size={26} color="#3E8E5E" />
                </View>
                <Text style={styles.photoPlaceholderText}>Subir o tomar foto</Text>
              </View>
            )}
          </TouchableOpacity>

          <Input
            label="¿Cómo se llama tu perro?"
            placeholder="Ej. Toby"
            value={name}
            onChangeText={(val) => {
              setName(val);
              if (error) setError('');
            }}
            error={error}
          />

          <Text style={styles.sectionLabel}>Tamaño</Text>
          <View style={styles.chipsRow}>
            <Chip
              label="Pequeño"
              selected={size === 'small'}
              onPress={() => setSize('small')}
            />
            <Chip
              label="Mediano"
              selected={size === 'medium'}
              onPress={() => setSize('medium')}
            />
            <Chip
              label="Grande"
              selected={size === 'large'}
              onPress={() => setSize('large')}
            />
          </View>

          <Input
            label="Raza (opcional)"
            placeholder="Ej. Mestizo, Golden, Caniche"
            value={breed}
            onChangeText={setBreed}
          />
        </KeyboardAwareScrollView>

        <View style={styles.footer}>
          <Button
            title={isEdit ? 'Guardar cambios' : 'Guardar mascota'}
            onPress={handleSubmit}
            size="lg"
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export const PetAddModal: React.FC<PetAddModalProps> = ({
  visible,
  mode = 'create',
  initialPet,
  onClose,
  onAddPet,
  onUpdatePet,
}) => {
  const [formKey, setFormKey] = useState(0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => setFormKey((k) => k + 1)}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            {visible ? (
              <PetAddModalForm
                key={`${mode}-${initialPet?.id ?? 'new'}-${formKey}`}
                mode={mode}
                initialPet={initialPet}
                onClose={onClose}
                onAddPet={onAddPet}
                onUpdatePet={onUpdatePet}
              />
            ) : null}
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(42, 36, 32, 0.45)',
    justifyContent: 'flex-end',
  },
  keyboardWrap: {
    width: '100%',
    maxHeight: '92%',
  },
  content: {
    backgroundColor: '#FFFCF7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: '#3E8E5E',
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    color: '#2A2420',
  },
  formScroll: {
    flexGrow: 0,
  },
  formScrollContent: {
    paddingBottom: 8,
  },
  sectionLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
    marginBottom: 8,
    marginTop: 8,
  },
  photoPicker: {
    width: '100%',
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    backgroundColor: '#F7F2EA',
    marginBottom: 8,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  photoIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E4EFE6',
    borderWidth: 1,
    borderColor: '#C5DEC9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    color: '#2F6E48',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 8,
  },
});
