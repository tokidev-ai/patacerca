import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Linking,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { buildWhatsAppUrl } from '@patacerca/core';

export interface WhatsAppButtonProps {
  phone: string;
  message: string;
  /** Cuadrado compacto solo icono */
  variant?: 'icon' | 'pill';
  size?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  message,
  variant = 'icon',
  size = 52,
  style,
  accessibilityLabel = 'Abrir WhatsApp',
}) => {
  const handlePress = () => {
    Linking.openURL(buildWhatsAppUrl(phone, message));
  };

  if (variant === 'pill') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={handlePress}
        style={[styles.pill, style]}
      >
        <FontAwesome name="whatsapp" size={22} color="#FFFFFF" />
        <Text style={styles.pillText}>WhatsApp</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      style={[
        styles.iconButton,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <FontAwesome name="whatsapp" size={Math.round(size * 0.46)} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1DA851',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    borderRadius: 9999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#1DA851',
  },
  pillText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
