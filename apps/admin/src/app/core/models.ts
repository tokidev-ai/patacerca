/**
 * Forma de los documentos de Firestore que lee el panel. Espeja
 * `packages/core/src/firestore/documents.ts` (se duplica a propósito: el proyecto Angular
 * no compila los paquetes de React Native).
 */
export type WalkerStatus = 'pending' | 'in_review' | 'approved';

export interface Walker {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  zone: string;
  zones: string[];
  distanceText: string;
  price30: number;
  price60: number;
  bio: string;
  days: string[];
  timeSlots: string[];
  status: WalkerStatus;
  /** Suspendido por el admin: no entra a la app ni aparece en búsquedas. */
  blocked: boolean;
  rating: number;
  reviewsCount: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface Verification {
  nationalIdNumber: string;
  ref1Name: string;
  ref1Phone: string;
  ref2Name: string;
  ref2Phone: string;
  interviewSlot: string;
  idFrontPhoto?: string;
  idBackPhoto?: string;
  selfiePhoto?: string;
  policeRecordPhoto?: string;
}

/** Dueño de perro (colección `owners`, doc id = teléfono). */
export interface Owner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  zone: string;
  petsCount: number;
  blocked: boolean;
  createdAt?: number;
  updatedAt?: number;
}

/** Zona/barrio (colección `zones`). Espeja `ZoneDocument` de @patacerca/core. */
export interface Zone {
  id: string;
  name: string;
  active: boolean;
  order: number;
  createdAt?: number;
  updatedAt?: number;
}
