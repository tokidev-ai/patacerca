import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface VerifiedBadgeProps {
  size?: number;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 18 }) => {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.check, { fontSize: Math.round(size * 0.6) }]}>✓</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#3E8E5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#FFFFFF',
    fontFamily: 'Figtree_600SemiBold',
    lineHeight: 14,
  },
});

