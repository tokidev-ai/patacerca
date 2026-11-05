import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { FS_COLLECTIONS, type Walker, type WalkerDocument } from '@patacerca/core';
import { getFirestoreDb } from './app';
import { documentToWalker } from './mappers';

/** Doc id (w1) o teléfono 8 dígitos — p. ej. seed Marco Rojas: id w1, phone 71110001 */
export async function findWalkerByIdOrPhone(idOrPhone: string): Promise<Walker | null> {
  const key = idOrPhone.trim();
  if (!key) return null;

  const db = getFirestoreDb();
  const direct = await getDoc(doc(db, FS_COLLECTIONS.walkers, key));
  if (direct.exists()) {
    return documentToWalker(direct.data() as WalkerDocument);
  }

  const q = query(
    collection(db, FS_COLLECTIONS.walkers),
    where('phone', '==', key),
    limit(1)
  );
  const snap = await getDocs(q);
  const first = snap.docs[0];
  if (!first) return null;
  return documentToWalker(first.data() as WalkerDocument);
}
