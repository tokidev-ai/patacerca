export const COCHABAMBA_ZONES = [
  'Queru Queru',
  'Recoleta',
  'Cala Cala',
  'Centro',
  'Sarco',
  'Tupuraya',
  'Hipódromo',
  'Temporal',
  'Muyurina',
  'Las Cuadras',
  'Sacaba',
  'Quillacollo',
  'Tiquipaya',
] as const;

export type CochabambaZone = (typeof COCHABAMBA_ZONES)[number];

export const DEFAULT_ZONE: CochabambaZone = 'Queru Queru';

