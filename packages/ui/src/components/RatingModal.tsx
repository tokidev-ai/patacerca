import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Button } from './Button';

export interface RatingModalProps {
  visible: boolean;
  walkerName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => void;
  /** Mientras se guarda: bloquea estrellas, comentario y cierre. */
  loading?: boolean;
}

const RATING_LABELS = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  walkerName,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0 || loading) return;
    onSubmit(rating, comment.trim() || undefined);
  };

  const handleClose = () => {
    if (loading) return;
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <Text style={styles.eyebrow}>Calificar paseo</Text>
              <Text style={styles.title}>¿Cómo estuvo el paseo con {walkerName}?</Text>
              <Text style={styles.subtitle}>
                Tu calificación ayuda a que otros dueños encuentren al mejor paseador.
              </Text>

              <View style={[styles.starsRow, loading && styles.disabled]}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => setRating(star)}
                    disabled={loading}
                    style={styles.starButton}
                  >
                    <Text
                      style={[
                        styles.starText,
                        star <= rating ? styles.starFilled : styles.starEmpty,
                      ]}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.ratingLabel, rating === 0 && styles.ratingHint]}>
                {rating === 0
                  ? 'Toca una estrella para calificar'
                  : RATING_LABELS[rating]}
              </Text>

              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Deja un comentario para el paseador (opcional)"
                placeholderTextColor="#8A7D70"
                multiline
                numberOfLines={3}
                editable={!loading}
                style={[styles.commentInput, loading && styles.disabled]}
              />

              <View style={styles.buttonRow}>
                <Button
                  title="Confirmar calificación"
                  onPress={handleSubmit}
                  size="md"
                  loading={loading}
                  disabled={rating === 0}
                />
                {loading && (
                  <Text style={styles.savingText}>Registrando tu calificación…</Text>
                )}
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
  content: {
    backgroundColor: '#FFFCF7',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
  },
  eyebrow: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: '#3E8E5E',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#6B6058',
    lineHeight: 20,
    marginBottom: 16,
  },
  ratingLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    color: '#2F6E48',
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 14,
  },
  ratingHint: {
    fontFamily: 'Figtree_400Regular',
    color: '#8A7D70',
  },
  disabled: {
    opacity: 0.6,
  },
  savingText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#6B6058',
    textAlign: 'center',
    marginTop: 10,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 6,
  },
  starText: {
    fontSize: 36,
  },
  starFilled: {
    color: '#3E8E5E',
  },
  starEmpty: {
    color: '#E6DCCD',
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    fontFamily: 'Figtree_400Regular',
    color: '#2A2420',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonRow: {
    width: '100%',
  },
});
