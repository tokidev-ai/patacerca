import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import {
  FS_COLLECTIONS,
  type IWalkersRepository,
  type Walker,
  type WalkerFilters,
} from '@patacerca/core';
import { getFirestoreDb } from '../firebase/app';
import { documentToWalker, walkerToDocument } from '../firebase/mappers';

export class FirebaseWalkersRepository implements IWalkersRepository {
  private applyFilters(list: Walker[], filters?: WalkerFilters): Walker[] {
    let result = [...list];
    if (!filters) return result;

    if (filters.query?.trim()) {
      const q = filters.query.toLowerCase().trim();
      result = result.filter(
        (w) => w.name.toLowerCase().includes(q) || w.zone.toLowerCase().includes(q)
      );
    }
    if (filters.availableToday) {
      result = result.filter((w) => w.availableToday);
    }
    if (filters.acceptsLargeDogs) {
      result = result.filter((w) => w.acceptsLargeDogs);
    }
    if (filters.travelCare) {
      result = result.filter((w) => w.travelCare);
    }
    if (filters.maxPrice && filters.maxPrice > 0) {
      result = result.filter((w) => w.price30 <= filters.maxPrice!);
    }
    if (filters.zone) {
      result.sort((a, b) => {
        const aMatches = a.zone.toLowerCase() === filters.zone!.toLowerCase();
        const bMatches = b.zone.toLowerCase() === filters.zone!.toLowerCase();
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
      });
    }
    return result;
  }

  async getWalkers(filters?: WalkerFilters): Promise<Walker[]> {
    const snap = await getDocs(collection(getFirestoreDb(), FS_COLLECTIONS.walkers));
    const list = snap.docs
      .map((d) => documentToWalker(d.data() as Parameters<typeof documentToWalker>[0]))
      .filter((w) => w.status === 'approved');
    return this.applyFilters(list, filters);
  }

  async getWalkerById(id: string): Promise<Walker | null> {
    const snap = await getDoc(doc(getFirestoreDb(), FS_COLLECTIONS.walkers, id));
    if (!snap.exists()) return null;
    return documentToWalker(snap.data() as Parameters<typeof documentToWalker>[0]);
  }

  async updateWalkerProfile(id: string, updates: Partial<Walker>): Promise<Walker> {
    const existing = await this.getWalkerById(id);
    if (!existing) {
      throw new Error(`Walker with id ${id} not found`);
    }
    const updated: Walker = { ...existing, ...updates, id: existing.id };
    const payload = walkerToDocument(updated);
    await setDoc(doc(getFirestoreDb(), FS_COLLECTIONS.walkers, id), payload, {
      merge: true,
    });
    return updated;
  }
}
