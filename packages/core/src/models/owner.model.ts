export type PetSize = 'small' | 'medium' | 'large';

export interface Pet {
  id: string;
  name: string;
  size: PetSize;
  breed?: string;
  photoUrl?: string;
}

export interface Owner {
  phone: string;
  email?: string;
  /** Foto de perfil (https tras subir a Storage; URI local solo en mock). */
  photoUrl?: string;
  name: string;
  zone: string;
  dogName: string;
  dogSize: PetSize;
  pets?: Pet[];
  createdAt: number;
}
