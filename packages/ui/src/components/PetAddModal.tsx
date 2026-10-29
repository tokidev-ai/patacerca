import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { PetSize } from '@patacerca/core';
import { Input } from './Input';
import { Chip } from './Chip';
import { Button } from './Button';
import { IconButton } from './IconButton';

export interface PetAddModalProps {
  visible: boolean;
  onClose: () => void;
  onAddPet: (pet: { name: string; size: PetSize; breed?: string }) => void;
}

export const PetAddModal: React.FC<PetAddModalProps> = ({
  visible,
  onClose,
  onAddPet,
}) => {
  const [name, setName] = useState('');
  const [size, setSize] = useState<PetSize>('medium');
  const [breed, setBreed] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Escribe el nombre de tu perrito');
      return;
    }
    onAddPet({
      name: name.trim(),
      size,
      breed: breed.trim() || undefined,
    });
    setName('');
    setBreed('');
    setSize('medium');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.eyebrow}>Nueva mascota</Text>
                  <Text style={styles.title}>Agregar perrito</Text>
                </View>
                <IconButton icon="close" size={36} onPress={onClose} />
              </View>

              <ScrollView style={styles.form}>
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

                <View style={styles.buttonWrapper}>
                  <Button
                    title="Guardar mascota"
                    onPress={handleSubmit}
                    size="md"
                  />
                </View>
              </ScrollView>
            </View>
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
  content: {
    backgroundColor: '#FFFCF7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  form: {
    width: '100%',
  },
  sectionLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
    marginBottom: 8,
    marginTop: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  buttonWrapper: {
    marginTop: 16,
    marginBottom: 16,
  },
});

