import React from 'react';
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';

export interface ChipProps extends TouchableOpacityProps {
  label: string;
  selected?: boolean;
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  size = 'md',
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.base,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        selected ? styles.selectedContainer : styles.unselectedContainer,
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.text,
          selected ? styles.selectedText : styles.unselectedText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sizeSm: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    minHeight: 36,
  },
  sizeMd: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    minHeight: 44,
  },
  unselectedContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E6DCCD',
  },
  selectedContainer: {
    backgroundColor: '#3E8E5E',
    borderColor: '#3E8E5E',
  },
  text: {
    fontSize: 14,
    fontFamily: 'Figtree_500Medium',
  },
  unselectedText: {
    color: '#2A2420',
  },
  selectedText: {
    color: '#FFFFFF',
  },
});

