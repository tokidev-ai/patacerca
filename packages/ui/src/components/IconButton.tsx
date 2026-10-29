import React from 'react';
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';

export interface IconButtonProps extends TouchableOpacityProps {
  icon: 'back' | 'close' | 'plus' | 'minus';
  size?: number;
  variant?: 'surface' | 'app' | 'translucent';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 44,
  variant = 'surface',
  style,
  ...props
}) => {
  const getIconSymbol = () => {
    switch (icon) {
      case 'back':
        return '←';
      case 'close':
        return '×';
      case 'plus':
        return '+';
      case 'minus':
        return '−';
    }
  };

  const getBackground = () => {
    switch (variant) {
      case 'app':
        return '#F7F2EA';
      case 'translucent':
        return 'rgba(255, 255, 255, 0.7)';
      case 'surface':
      default:
        return '#FFFCF7';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={
        icon === 'back'
          ? 'Volver'
          : icon === 'close'
          ? 'Cerrar'
          : icon === 'plus'
          ? 'Aumentar'
          : 'Disminuir'
      }
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getBackground(),
        },
        style,
      ]}
      {...props}
    >
      <Text style={[styles.symbol, icon === 'close' && styles.closeSymbol]}>
        {getIconSymbol()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: '#E6DCCD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 20,
    color: '#2A2420',
    fontFamily: 'Figtree_600SemiBold',
    lineHeight: 22,
  },
  closeSymbol: {
    fontSize: 22,
    lineHeight: 22,
  },
});

