import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { AppIcon } from './AppIcon';

export interface SelectChipProps {
  label: string;
  onPress: () => void;
  /** Estilo resaltado (zona elegida, filtros activos). */
  emphasized?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Pill selector con chevron — mismo aspecto en zona, filtros, etc. */
export const SelectChip: React.FC<SelectChipProps> = ({
  label,
  onPress,
  emphasized = true,
  style,
  accessibilityLabel,
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[
      styles.base,
      emphasized ? styles.emphasized : styles.neutral,
      style,
    ]}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel ?? label}
  >
    <Text
      style={[styles.label, emphasized ? styles.labelEmphasized : styles.labelNeutral]}
      numberOfLines={1}
    >
      {label}
    </Text>
    <AppIcon
      name="chevron-down"
      size={16}
      color={emphasized ? '#2F6E48' : '#6B6058'}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
    flex: 1,
    minWidth: 0,
  },
  emphasized: {
    backgroundColor: '#E4EFE6',
    borderWidth: 1,
    borderColor: '#3E8E5E',
  },
  neutral: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DCCD',
  },
  label: {
    flex: 1,
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
  },
  labelEmphasized: {
    color: '#2F6E48',
  },
  labelNeutral: {
    color: '#2A2420',
  },
});
