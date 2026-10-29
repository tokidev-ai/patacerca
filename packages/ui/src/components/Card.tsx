import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewProps,
  TouchableOpacityProps,
} from 'react-native';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  variant?: 'surface' | 'dark' | 'sand' | 'accentSoft';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'surface',
  style,
  ...props
}) => {
  const getBackground = () => {
    switch (variant) {
      case 'dark':
        return styles.dark;
      case 'sand':
        return styles.sand;
      case 'accentSoft':
        return styles.accentSoft;
      case 'surface':
      default:
        return styles.surface;
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.base, getBackground(), style]}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.base, getBackground(), style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    width: '100%',
  },
  surface: {
    backgroundColor: '#FFFCF7',
    borderColor: '#E6DCCD',
  },
  dark: {
    backgroundColor: '#2A2420',
    borderColor: '#2A2420',
  },
  sand: {
    backgroundColor: '#EFE6D8',
    borderColor: '#E6DCCD',
  },
  accentSoft: {
    backgroundColor: '#E4EFE6',
    borderColor: '#BFD9C7',
  },
});

