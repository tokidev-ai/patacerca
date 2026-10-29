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
}

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  walkerName,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, comment.trim() || undefined);
    setRating(5);
    setComment('');
  };

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
            <View style={styles.content}>
              <Text style={styles.eyebrow}>Calificar paseo</Text>
              <Text style={styles.title}>¿Cómo estuvo el paseo con {walkerName}?</Text>
              <Text style={styles.subtitle}>
                Tu calificación ayuda a que otros dueños encuentren al mejor paseador.
              </Text>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => setRating(star)}
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

              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Deja un comentario para el paseador (opcional)"
                placeholderTextColor="#8A7D70"
                multiline
                numberOfLines={3}
                style={styles.commentInput}
              />

              <View style={styles.buttonRow}>
                <Button
                  title="Confirmar calificación"
                  onPress={handleSubmit}
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

