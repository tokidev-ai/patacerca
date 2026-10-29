import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WalkRequestStatus } from '@patacerca/core';

export interface StatusPillProps {
  status?: WalkRequestStatus;
  label?: string;
  variant?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'verified';
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  variant,
}) => {
  const getStyleAndText = () => {
    if (variant === 'verified') {
      return {
        bg: '#3E8E5E',
        color: '#FFFFFF',
        text: label || '✓ Paseador verificado',
      };
    }

    const currentStatus = status || variant;

    switch (currentStatus) {
      case 'accepted':
      case 'completed':
      case 'confirmed':
        return {
          bg: '#E4EFE6',
          color: '#2F6E48',
          text:
            label ||
            (currentStatus === 'completed'
              ? 'Completado'
              : currentStatus === 'confirmed'
              ? 'Finalizado'
              : 'Aceptada'),
        };
      case 'rejected':
        return {
          bg: '#F6E1DA',
          color: '#B4472B',
          text: label || 'No disponible',
        };
      case 'cancelled':
        return {
          bg: '#EFE6D8',
          color: '#8A7D70',
          text: label || 'Cancelada',
        };
      case 'pending':
      default:
        return {
          bg: '#EFE6D8',
          color: '#6B6058',
          text: label || 'Esperando respuesta',
        };
    }
  };

  const config = getStyleAndText();

  return (
    <View style={[styles.pill, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 12,
  },
});

