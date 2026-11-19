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
