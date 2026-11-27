/**
 * Fuente de datos: mock (AsyncStorage) vs Firebase (Firestore).
 * En Expo solo variables EXPO_PUBLIC_* están disponibles en el cliente.
 */

export function shouldUseMockData(): boolean {
  const raw = process.env.EXPO_PUBLIC_USE_MOCK_DATA;
  if (raw === 'false' || raw === '0') return false;
  if (raw === 'true' || raw === '1') return true;
  /** Por defecto mock hasta que configures Firebase y pongas EXPO_PUBLIC_USE_MOCK_DATA=false */
  return true;
}

export interface FirebasePublicConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function getFirebasePublicConfig(): FirebasePublicConfig | null {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim();
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim();

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function isFirebaseConfigured(): boolean {
  return getFirebasePublicConfig() !== null;
}

/** true si el registro manda SMS reales (Firebase Phone Auth); false en modo mock (código 1234). */
export function isRealSmsEnabled(): boolean {
  return !shouldUseMockData() && isFirebaseConfigured();
}

/** Cada app Expo define su rol en .env (owners | walkers). */
export function getAppRoleFromEnv(): 'owner' | 'walker' {
  const role = process.env.EXPO_PUBLIC_APP_ROLE?.trim().toLowerCase();
  return role === 'walker' ? 'walker' : 'owner';
}
