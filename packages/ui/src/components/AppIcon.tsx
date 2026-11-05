import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import type { StyleProp, TextStyle } from 'react-native';

/** Iconos Feather con colores del design system Patacerca. No usar emojis como iconos de UI. */
export type AppIconName =
  'camera' | 'image' | 'edit-2' | 'trash-2' | 'chevron-right' | 'search' | 'check';

export interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 22,
  color = '#3E8E5E',
  style,
}) => {
  return <Feather name={name} size={size} color={color} style={style} />;
};
