import { colors, avatarColors } from './colors';
import { fontFamilies } from './fonts';

export const radii = {
  input: 14,
  card: 20,
  stat: 16,
  sheet: 24,
  pill: 9999,
} as const;

export const tokens = {
  colors,
  avatarColors,
  fontFamilies,
  radii,
};

