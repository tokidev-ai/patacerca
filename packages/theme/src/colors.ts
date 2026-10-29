export const colors = {
  app: '#F7F2EA',
  surface: '#FFFCF7',
  input: '#FFFFFF',
  line: '#E6DCCD',
  ink: '#2A2420',
  muted: '#6B6058',
  'muted-2': '#4A413A',
  'muted-3': '#8A7D70',
  accent: {
    DEFAULT: '#3E8E5E',
    dark: '#2F6E48',
    soft: '#E4EFE6',
  },
  sand: '#EFE6D8',
  danger: {
    DEFAULT: '#B4472B',
    soft: '#F6E1DA',
  },
  disabledBg: '#E6DCCD',
  disabledFg: '#8A7D70',
  dashed: '#CDBFAB',
  toggleOff: '#CDBFAB',
  verifiedBorder: '#BFD9C7',
  overlay: 'rgba(42, 36, 32, 0.45)',
} as const;

export const avatarColors = [
  { bg: '#E4EFE6', text: '#2F6E48', name: 'green' },
  { bg: '#F3E3D3', text: '#9A5426', name: 'peach' },
  { bg: '#E8E1F0', text: '#5B4A7A', name: 'purple' },
  { bg: '#F5E6C4', text: '#7A5A12', name: 'mustard' },
  { bg: '#DDE8EF', text: '#2F5A75', name: 'blue' },
  { bg: '#F1DCDC', text: '#8A3B3B', name: 'pink' },
] as const;

export type AvatarColorName = (typeof avatarColors)[number]['name'];
