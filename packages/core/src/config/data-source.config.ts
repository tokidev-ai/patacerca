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

/** Minutos de validez del OTP en Firestore (colección otpSessions). */
export function getOtpTtlMinutes(): number {
  const raw = process.env.EXPO_PUBLIC_OTP_TTL_MINUTES;
  const n = raw ? Number.parseInt(raw, 10) : 10;
  return Number.isFinite(n) && n > 0 ? n : 10;
}

/**
 * Si está definido, siempre se usa este código (pruebas manuales en consola Firebase).
 * Si no, se genera un código aleatorio de 4 dígitos y se guarda en otpSessions.
 */
export function getOtpFixedCode(): string | null {
  const code = process.env.EXPO_PUBLIC_OTP_FIXED_CODE?.trim();
  return code && /^\d{4,6}$/.test(code) ? code : null;
}

/** Cada app Expo define su rol en .env (owners | walkers). */
export function getAppRoleFromEnv(): 'owner' | 'walker' {
  const role = process.env.EXPO_PUBLIC_APP_ROLE?.trim().toLowerCase();
  return role === 'walker' ? 'walker' : 'owner';
}
