import { collection, getDocs } from 'firebase/firestore';
import {
  COCHABAMBA_ZONES,
  FS_COLLECTIONS,
  type IZonesRepository,
  type ZoneDocument,
} from '@patacerca/core';
import { getFirestoreDb } from '../firebase/app';

export class FirebaseZonesRepository implements IZonesRepository {
  async getActiveZones(): Promise<string[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), FS_COLLECTIONS.zones));
      if (snap.empty) return [...COCHABAMBA_ZONES];
      return snap.docs
        .map((d) => d.data() as ZoneDocument)
        .filter((z) => z.active)
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'es'))
        .map((z) => z.name);
    } catch (e) {
      console.warn('[zonas] no se pudieron leer, uso lista por defecto:', e);
      return [...COCHABAMBA_ZONES];
    }
  }
}
