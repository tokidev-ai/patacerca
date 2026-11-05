/**
 * Nombres de colecciones Firestore (única fuente de verdad).
 * Ver docs/FIREBASE.md para el mapa completo y reglas de seguridad.
 */

export const FS_COLLECTIONS = {
  /** Dueños — doc id: teléfono 8 dígitos (+591 implícito) */
  owners: 'owners',
  /** Paseadores — doc id: walker.id (ej. w_173… o teléfono en onboarding) */
  walkers: 'walkers',
  /** Solicitudes de paseo — doc id auto */
  walkRequests: 'walkRequests',
  /** Verificación KYC — doc id: walkerId */
  verifications: 'verifications',
  /** OTP login (WhatsApp pendiente) — doc id: teléfono 8 dígitos */
  otpSessions: 'otpSessions',
  /** Chat in-app (fase 2; hoy coordinación por WhatsApp) */
  chatThreads: 'chatThreads',
} as const;

export type FirestoreCollectionName =
  (typeof FS_COLLECTIONS)[keyof typeof FS_COLLECTIONS];

/** Subcolección bajo chatThreads/{threadId}/messages */
export const FS_CHAT_MESSAGES_SUB = 'messages';
