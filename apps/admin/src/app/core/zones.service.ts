import { Injectable, computed, signal } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { getDb } from './firebase';
import type { Zone } from './models';

/** Lista inicial (igual a `COCHABAMBA_ZONES` de @patacerca/core) para poblar la colección. */
export const DEFAULT_ZONES = [
  'Queru Queru',
  'Recoleta',
  'Cala Cala',
  'Centro',
  'Sarco',
  'Tupuraya',
  'Hipódromo',
  'Temporal',
  'Muyurina',
  'Las Cuadras',
  'Sacaba',
  'Quillacollo',
  'Tiquipaya',
];

export const ZONE_EXISTS_ERROR = 'ZONE_EXISTS';

/** "Las Cuadras" → "las-cuadras" (id estable del documento). */
export function zoneSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable({ providedIn: 'root' })
export class ZonesService {
  readonly zones = signal<Zone[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly activeCount = computed(() => this.zones().filter((z) => z.active).length);

  private unsubscribe: Unsubscribe | null = null;

  start(): void {
    if (this.unsubscribe) return;
    this.unsubscribe = onSnapshot(
      collection(getDb(), 'zones'),
      (snap) => {
        this.zones.set(
          snap.docs
            .map((d) => {
              const data = d.data();
              return {
                id: d.id,
                name: data['name'] ?? d.id,
                active: data['active'] !== false,
                order: data['order'] ?? 0,
                createdAt: data['createdAt'],
                updatedAt: data['updatedAt'],
              } satisfies Zone;
            })
            .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'es')),
        );
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

  async add(rawName: string): Promise<void> {
    const name = rawName.trim().replace(/\s+/g, ' ');
    const id = zoneSlug(name);
    if (!id) return;
    if (this.zones().some((z) => z.id === id)) throw new Error(ZONE_EXISTS_ERROR);
    const now = Date.now();
    const order = Math.max(0, ...this.zones().map((z) => z.order)) + 1;
    await setDoc(doc(getDb(), 'zones', id), {
      name,
      active: true,
      order,
      createdAt: now,
      updatedAt: now,
    });
  }

  async setActive(id: string, active: boolean): Promise<void> {
    await updateDoc(doc(getDb(), 'zones', id), { active, updatedAt: Date.now() });
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(getDb(), 'zones', id));
  }

  /** Crea las zonas por defecto (solo las que falten). */
  async seedDefaults(): Promise<void> {
    const batch = writeBatch(getDb());
    const existing = new Set(this.zones().map((z) => z.id));
    const now = Date.now();
    DEFAULT_ZONES.forEach((name, i) => {
      const id = zoneSlug(name);
      if (existing.has(id)) return;
      batch.set(doc(getDb(), 'zones', id), {
        name,
        active: true,
        order: i + 1,
        createdAt: now,
        updatedAt: now,
      });
    });
    await batch.commit();
  }
}
