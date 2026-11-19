import { Injectable, signal } from '@angular/core';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseReady, getDb, getFirebaseAuth } from './firebase';

export const NOT_ADMIN_ERROR = 'NOT_ADMIN';

/** El rol vive en Firestore: `userAccounts/{uid}.role === 'admin'` (ver `npm run admin:create`). */
async function fetchIsAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(getDb(), 'userAccounts', uid));
    return snap.exists() && snap.data()['role'] === 'admin';
  } catch {
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(null);
  readonly isAdmin = signal(false);

  /** Se resuelve cuando Firebase ya dijo si hay una sesión guardada (y si es admin). */
  readonly whenReady: Promise<void>;

  constructor() {
    this.whenReady = new Promise<void>((resolve) => {
      if (!firebaseReady) {
        resolve();
        return;
      }
      onAuthStateChanged(getFirebaseAuth(), async (user) => {
        this.user.set(user);
        this.isAdmin.set(user ? await fetchIsAdmin(user.uid) : false);
        resolve();
      });
    });
  }

  async login(email: string, password: string): Promise<void> {
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    if (!(await fetchIsAdmin(cred.user.uid))) {
      await signOut(getFirebaseAuth());
      throw new Error(NOT_ADMIN_ERROR);
    }
    this.user.set(cred.user);
    this.isAdmin.set(true);
  }

  async logout(): Promise<void> {
    await signOut(getFirebaseAuth());
    this.user.set(null);
    this.isAdmin.set(false);
  }
}
