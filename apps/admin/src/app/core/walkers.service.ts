import { Injectable, computed, signal } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { getDb } from './firebase';
import type { Verification, Walker, WalkerStatus } from './models';

function toWalker(id: string, data: DocumentData): Walker {
  return {
    id,
    name: data['name'] ?? '',
    phone: data['phone'] ?? '',
    email: data['email'],
    photoUrl: data['photoUrl'],
    zone: data['zone'] ?? '',
    zones: data['zones'] ?? [],
    distanceText: data['distanceText'] ?? '',
    price30: data['price30'] ?? 0,
    price60: data['price60'] ?? 0,
    bio: data['bio'] ?? '',
    days: data['days'] ?? [],
    timeSlots: data['timeSlots'] ?? [],
    status: (data['status'] as WalkerStatus) ?? 'pending',
    rating: data['rating'] ?? 0,
    reviewsCount: data['reviewsCount'] ?? 0,
    createdAt: data['createdAt'],
    updatedAt: data['updatedAt'],
  };
}

@Injectable({ providedIn: 'root' })
export class WalkersService {
  readonly walkers = signal<Walker[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly inReview = computed(() => this.byStatus('in_review'));
  readonly approved = computed(() => this.byStatus('approved'));
  readonly pending = computed(() => this.byStatus('pending'));

  private unsubscribe: Unsubscribe | null = null;

  /** Escucha la colección `walkers` en tiempo real (una sola suscripción). */
  start(): void {
    if (this.unsubscribe) return;
    this.unsubscribe = onSnapshot(
      collection(getDb(), 'walkers'),
      (snap) => {
        this.walkers.set(snap.docs.map((d) => toWalker(d.id, d.data())));
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

  async getVerification(walkerId: string): Promise<Verification | null> {
    const snap = await getDoc(doc(getDb(), 'verifications', walkerId));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      nationalIdNumber: d['nationalIdNumber'] ?? '',
      ref1Name: d['ref1Name'] ?? '',
      ref1Phone: d['ref1Phone'] ?? '',
      ref2Name: d['ref2Name'] ?? '',
      ref2Phone: d['ref2Phone'] ?? '',
      interviewSlot: d['interviewSlot'] ?? '',
      idFrontPhoto: d['idFrontPhoto'],
      idBackPhoto: d['idBackPhoto'],
      selfiePhoto: d['selfiePhoto'],
      policeRecordPhoto: d['policeRecordPhoto'],
    };
  }

  /** Aprueba la solicitud: el paseador pasa a "verificado" y aparece en las búsquedas. */
  async approve(walkerId: string): Promise<void> {
    await updateDoc(doc(getDb(), 'walkers', walkerId), {
      status: 'approved' satisfies WalkerStatus,
      updatedAt: Date.now(),
    });
  }

  private byStatus(status: WalkerStatus): Walker[] {
    return this.walkers()
      .filter((w) => w.status === status)
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }
}
