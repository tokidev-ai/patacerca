import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Pet, PetSize } from '@patacerca/core';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { AppIcon } from './AppIcon';

function petSizeLabel(size: PetSize): string {
  if (size === 'small') return 'Pequeño';
  if (size === 'large') return 'Grande';
  return 'Mediano';
}

export interface PetDetailModalProps {
  visible: boolean;
  pet: Pet | null;
  defaultImageSource?: ImageSourcePropType;
  onClose: () => void;
  onEdit: (pet: Pet) => void;
  onDelete: (pet: Pet) => void;
}

export const PetDetailModal: React.FC<PetDetailModalProps> = ({
  visible,
  pet,
  defaultImageSource,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!pet) return null;

  const imageSource: ImageSourcePropType = pet.photoUrl
    ? { uri: pet.photoUrl }
    : defaultImageSource || { uri: '' };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.content}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.eyebrow}>Mascota</Text>
                  <Text style={styles.title}>{pet.name}</Text>
                </View>
                <IconButton icon="close" size={36} onPress={onClose} />
              </View>

              <View style={styles.photoFrame}>
                {pet.photoUrl || defaultImageSource ? (
                  <Image source={imageSource} style={styles.photo} resizeMode="cover" />
                ) : (
                  <View style={styles.photoFallback}>
                    <AppIcon name="image" size={32} color="#3E8E5E" />
                  </View>
                )}
              </View>

              <View style={styles.details}>
                <Text style={styles.detailLabel}>Tamaño</Text>
                <Text style={styles.detailValue}>{petSizeLabel(pet.size)}</Text>
                {pet.breed ? (
                  <>
                    <Text style={[styles.detailLabel, styles.detailLabelSpaced]}>
                      Raza
                    </Text>
                    <Text style={styles.detailValue}>{pet.breed}</Text>
                  </>
                ) : null}
              </View>

              <View style={styles.actions}>
                <Button
                  title="Editar"
                  variant="outline"
                  onPress={() => onEdit(pet)}
                  size="md"
                  style={styles.actionBtn}
                />
                <Button
                  title="Eliminar"
                  variant="danger-soft"
                  onPress={() => onDelete(pet)}
                  size="md"
                  style={styles.actionBtn}
                />
              </View>
            </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
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
    fontSize: 24,
    color: '#2A2420',
  },
  photoFrame: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    backgroundColor: '#F7F2EA',
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    marginBottom: 20,
  },
  detailLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#6B6058',
  },
  detailLabelSpaced: {
    marginTop: 12,
  },
  detailValue: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 16,
    color: '#2A2420',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
  },
});
