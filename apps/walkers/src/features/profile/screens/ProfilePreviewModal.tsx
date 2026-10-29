import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Avatar, VerifiedBadge, Button } from '@patacerca/ui';
import { Walker, WalkerStatus } from '@patacerca/core';

export interface ProfilePreviewModalProps {
  visible: boolean;
  walker: Walker | null;
  status: WalkerStatus;
  price30: number;
  bio: string;
  onClose: () => void;
}

export const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({
  visible,
  walker,
  status,
  price30,
  bio,
  onClose,
}) => {
  const isApproved = status === 'approved';
  const name = walker?.name || 'Paseador';
  const zone = walker?.zone || 'Cochabamba';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.eyebrow}>Así te ven los dueños</Text>

              {/* Simulated Card from Owners App */}
              <View style={styles.card}>
                <Avatar
                  name={name}
                  colorName={walker?.colorName || 'green'}
                  size={56}
                />
                <View style={styles.cardInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.walkerName}>{name}</Text>
                    {isApproved && <VerifiedBadge size={16} />}
                  </View>
                  <Text style={styles.walkerSubtitle}>
                    {zone} · a pocas cuadras
                  </Text>
                  <Text style={styles.badgeText}>Nuevo en Patacerca</Text>
                </View>
                <View style={styles.priceCol}>
                  <Text style={styles.fromText}>desde</Text>
                  <Text style={styles.priceValue}>{price30} Bs</Text>
                </View>
              </View>

              {/* Bio Preview */}
              <View style={styles.bioContainer}>
                <Text style={styles.bioText}>
                  {bio.trim() ||
                    'Agrega una descripción para que los dueños te conozcan.'}
                </Text>
              </View>

              {/* Approval notice */}
              {!isApproved && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    Aparecerás en búsquedas cuando tu verificación esté
                    aprobada.
                  </Text>
                </View>
              )}

              <View style={styles.buttonWrapper}>
                <Button
                  title="Cerrar"
                  variant="primary"
                  onPress={onClose}
                  size="md"
                />
              </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#F7F2EA',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
  },
  eyebrow: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#3E8E5E',
    marginBottom: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walkerName: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
  },
  walkerSubtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginTop: 2,
  },
  badgeText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 12,
    color: '#3E8E5E',
    marginTop: 4,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  fromText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 11,
    color: '#6B6058',
  },
  priceValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
  },
  bioContainer: {
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  bioText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#4A413A',
  },
  warningBox: {
    marginBottom: 16,
  },
  warningText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#B4472B',
    lineHeight: 18,
  },
  buttonWrapper: {
    width: '100%',
  },
});

