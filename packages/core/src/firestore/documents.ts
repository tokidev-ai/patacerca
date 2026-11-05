import type { PetSize } from '../models/owner.model';
import type { WalkerStatus } from '../models/walker.model';

/**
 * Documentos Firestore (shape persistido). Los modelos de dominio (@patacerca/core models)
 * pueden incluir campos UI-only; aquí definimos lo que se guarda en la nube.
 */

export interface FirestoreTimestamps {
  createdAt: number;
  updatedAt: number;
}

/** owners/{phone8} */
export interface OwnerDocument extends FirestoreTimestamps {
  phone: string;
  name: string;
  zone: string;
  dogName: string;
  dogSize: PetSize;
  pets: {
    id: string;
    name: string;
    size: PetSize;
    breed?: string;
    /** Solo URLs https; file:// local no se sube aún (Storage pendiente) */
    photoUrl?: string;
  }[];
}

/** walkers/{walkerId} */
export interface WalkerDocument extends FirestoreTimestamps {
  id: string;
  phone: string;
  name: string;
  zone: string;
  distanceText: string;
  rating: number;
  reviewsCount: number;
  price30: number;
  price60: number;
  availableToday: boolean;
  acceptsLargeDogs: boolean;
  travelCare: boolean;
  colorName: string;
  bio: string;
  reviews: {
    id: string;
    authorName: string;
    zone: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
  status: WalkerStatus;
  zones: string[];
  days: string[];
  timeSlots: string[];
}

/** walkRequests/{requestId} */
export interface WalkRequestDocument extends FirestoreTimestamps {
  id: string;
  ownerPhone: string;
  ownerName: string;
  ownerZone: string;
  dogName: string;
  dogSize: PetSize;
  walkerId: string;
  walkerName: string;
  durationMinutes: 30 | 60;
  dayText: string;
  timeText: string;
  note?: string;
  price: number;
  status: string;
  rating?: number;
  ratingComment?: string;
}

/** verifications/{walkerId} */
export interface VerificationDocument extends FirestoreTimestamps {
  walkerId: string;
  nationalIdNumber: string;
  idFrontUploaded: boolean;
  idBackUploaded: boolean;
  selfieUploaded: boolean;
  policeRecordUploaded: boolean;
  ref1Name: string;
  ref1Phone: string;
  ref2Name: string;
  ref2Phone: string;
  interviewSlot: string;
  /**
   * URIs locales file:// de fotos de verificación — no se suben a Storage aún.
   * Cuando integres Firebase Storage, guarda paths en idFrontStoragePath, etc.
   */
  idFrontLocalUri?: string;
  idBackLocalUri?: string;
  selfieLocalUri?: string;
  policeRecordLocalUri?: string;
}

/** otpSessions/{phone8} — lee el código en Firebase Console mientras no hay WhatsApp */
export interface OtpSessionDocument {
  phone: string;
  code: string;
  role: 'owner' | 'walker';
  expiresAt: number;
  createdAt: number;
}

/** chatThreads/{threadId} — threadId recomendado: `${ownerPhone}_${walkerId}` */
export interface ChatThreadDocument extends FirestoreTimestamps {
  id: string;
  ownerPhone: string;
  ownerName: string;
  walkerId: string;
  walkerName: string;
  updatedAt: number;
}

/** chatThreads/{threadId}/messages/{messageId} */
export interface ChatMessageDocument {
  id: string;
  sender: 'owner' | 'walker';
  text: string;
  timestamp: number;
}
