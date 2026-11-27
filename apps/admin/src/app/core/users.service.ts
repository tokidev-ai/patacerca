import { Injectable, signal } from '@angular/core';
import {
  collection,
  deleteField,
  doc,
  onSnapshot,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { getDb } from './firebase';
import type { Owner } from './models';

export type UserKind = 'owner' | 'walker';

function toOwner(id: string, data: DocumentData): Owner {
  return {
    id,
    name: data['name'] ?? '',
    phone: data['phone'] ?? id,
    email: data['email'],
    photoUrl: data['photoUrl'],
    zone: data['zone'] ?? '',
    petsCount: Array.isArray(data['pets']) ? data['pets'].length : 0,
    blocked: data['blocked'] === true,
    createdAt: data['createdAt'],
    updatedAt: data['updatedAt'],
  };
}

/** Dueños en tiempo real + suspender/reactivar cuentas (dueños y paseadores). */
@Injectable({ providedIn: 'root' })
export class UsersService {
  readonly owners = signal<Owner[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private unsubscribe: Unsubscribe | null = null;

  start(): void {
    if (this.unsubscribe) return;
    this.unsubscribe = onSnapshot(
      collection(getDb(), 'owners'),
      (snap) => {
        this.owners.set(snap.docs.map((d) => toOwner(d.id, d.data())));
        this.loading.set(false);
        this.error.set(null);
      },
      (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    );
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  /** Suspende o reactiva. La app lo revisa al abrir y al iniciar sesión. */
  async setBlocked(kind: UserKind, id: string, blocked: boolean): Promise<void> {
    await updateDoc(doc(getDb(), kind === 'owner' ? 'owners' : 'walkers', id), {
      blocked,
      blockedAt: blocked ? Date.now() : deleteField(),
      updatedAt: Date.now(),
    });
  }
}
