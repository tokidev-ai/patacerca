import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

/** false mientras `environment.ts` no tenga la configuración de Firebase. */
export const firebaseReady = Boolean(environment.firebase.apiKey && environment.firebase.projectId);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getApp(): FirebaseApp {
  if (!firebaseReady) {
    throw new Error('Falta configurar Firebase en src/environments/environment.ts');
  }
  app ??= initializeApp(environment.firebase);
  return app;
}

export function getFirebaseAuth(): Auth {
  authInstance ??= getAuth(getApp());
  return authInstance;
}

export function getDb(): Firestore {
  dbInstance ??= getFirestore(getApp());
  return dbInstance;
}
