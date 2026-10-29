import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface TabBarItemProps {
  label: string;
  focused: boolean;
  onPress: () => void;
  badgeCount?: number;
}

export const TabBarItem: React.FC<TabBarItemProps> = ({
  label,
  focused,
  onPress,
  badgeCount,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.container}
    >
      <View
        style={[
          styles.indicator,
          focused ? styles.indicatorActive : styles.indicatorInactive,
        ]}
      />
      <View style={styles.labelRow}>
        <Text
          style={[
            styles.label,
            focused ? styles.labelFocused : styles.labelUnfocused,
          ]}
        >
          {label}
        </Text>
        {Boolean(badgeCount && badgeCount > 0) && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFCF7',
  },
  indicator: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: 6,
  },
  indicatorActive: {
    backgroundColor: '#3E8E5E',
  },
  indicatorInactive: {
    backgroundColor: 'transparent',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
  },
  labelFocused: {
    color: '#2A2420',
  },
  labelUnfocused: {
    color: '#8A7D70',
  },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3E8E5E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Figtree_600SemiBold',
  },
});

