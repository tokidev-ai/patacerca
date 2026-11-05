import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFirebasePublicConfig, isFirebaseConfigured } from '@patacerca/core';

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export function assertFirebaseConfigured(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase no configurado. Copia .env.example → .env y define EXPO_PUBLIC_FIREBASE_*'
    );
  }
  return getFirebaseApp();
}

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) return appInstance;
  const config = getFirebasePublicConfig();
  if (!config) {
    throw new Error('Missing EXPO_PUBLIC_FIREBASE_* environment variables');
  }
  appInstance = getApps().length > 0 ? getApps()[0]! : initializeApp(config);
  return appInstance;
}

export function getFirestoreDb(): Firestore {
  if (dbInstance) return dbInstance;
  dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}
