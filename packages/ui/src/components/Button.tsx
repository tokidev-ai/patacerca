import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';

export type ButtonVariant = 'primary' | 'outline' | 'danger-soft' | 'disabled';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading || variant === 'disabled';

  const getContainerStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineContainer;
      case 'danger-soft':
        return styles.dangerSoftContainer;
      case 'disabled':
        return styles.disabledContainer;
      case 'primary':
      default:
        return isDisabled ? styles.disabledContainer : styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'danger-soft':
        return styles.dangerSoftText;
      case 'disabled':
        return styles.disabledText;
      case 'primary':
      default:
        return isDisabled ? styles.disabledText : styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'md':
        return styles.sizeMd;
      case 'lg':
      default:
        return styles.sizeLg;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[styles.base, getContainerStyle(), getSizeStyle(), style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : '#3E8E5E'}
          size="small"
        />
      ) : (
        <Text style={[styles.textBase, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  sizeSm: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  sizeMd: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  sizeLg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 54,
  },
  primaryContainer: {
    backgroundColor: '#3E8E5E',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2A2420',
  },
  dangerSoftContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
  },
  disabledContainer: {
    backgroundColor: '#E6DCCD',
  },
  textBase: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 17,
  },
  outlineText: {
    color: '#2A2420',
  },
  dangerSoftText: {
    color: '#B4472B',
  },
  disabledText: {
    color: '#8A7D70',
  },
});

