import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  FS_COLLECTIONS,
  applyReviewToWalker,
  buildWalkerReview,
  type CreateWalkRequestInput,
  type IRequestsRepository,
  type WalkRequest,
  type WalkRequestStatus,
} from '@patacerca/core';
import { getFirestoreDb } from '../firebase/app';
import {
  documentToWalker,
  documentToWalkRequest,
  walkRequestToDocument,
} from '../firebase/mappers';

export class FirebaseRequestsRepository implements IRequestsRepository {
  async getRequestsByOwner(ownerPhone: string): Promise<WalkRequest[]> {
    const q = query(
      collection(getFirestoreDb(), FS_COLLECTIONS.walkRequests),
      where('ownerPhone', '==', ownerPhone)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) =>
        documentToWalkRequest(d.data() as Parameters<typeof documentToWalkRequest>[0])
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getRequestsByWalker(walkerId: string): Promise<WalkRequest[]> {
    const q = query(
      collection(getFirestoreDb(), FS_COLLECTIONS.walkRequests),
      where('walkerId', '==', walkerId)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) =>
        documentToWalkRequest(d.data() as Parameters<typeof documentToWalkRequest>[0])
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getRequestById(requestId: string): Promise<WalkRequest | null> {
    const snap = await getDoc(
      doc(getFirestoreDb(), FS_COLLECTIONS.walkRequests, requestId)
    );
    if (!snap.exists()) return null;
    return documentToWalkRequest(
      snap.data() as Parameters<typeof documentToWalkRequest>[0]
    );
  }

  async createRequest(input: CreateWalkRequestInput): Promise<WalkRequest> {
    const id = `req_${Date.now()}`;
    const createdAt = Date.now();
    const newRequest: WalkRequest = {
      id,
      ...input,
      status: 'pending',
      createdAt,
    };
    const payload = walkRequestToDocument(newRequest);
    await setDoc(doc(getFirestoreDb(), FS_COLLECTIONS.walkRequests, id), payload);
    return newRequest;
  }

  async updateRequestStatus(
    requestId: string,
    status: WalkRequestStatus
  ): Promise<WalkRequest> {
    const existing = await this.getRequestById(requestId);
    if (!existing) throw new Error('Request not found');
    const updated: WalkRequest = {
      ...existing,
      status,
      updatedAt: Date.now(),
    };
    await setDoc(
      doc(getFirestoreDb(), FS_COLLECTIONS.walkRequests, requestId),
      walkRequestToDocument(updated),
      { merge: true }
    );
    return updated;
  }

  async rateCompletedWalk(
    requestId: string,
    rating: number,
    comment?: string
  ): Promise<WalkRequest> {
    const db = getFirestoreDb();
    const requestRef = doc(db, FS_COLLECTIONS.walkRequests, requestId);

    return runTransaction(db, async (tx) => {
      const requestSnap = await tx.get(requestRef);
      if (!requestSnap.exists()) throw new Error('Request not found');
      const existing = documentToWalkRequest(
        requestSnap.data() as Parameters<typeof documentToWalkRequest>[0]
      );
      if (existing.status !== 'completed' || existing.rating != null) {
        throw new Error('Este paseo ya fue calificado o aún no está completado');
      }

      const walkerRef = doc(db, FS_COLLECTIONS.walkers, existing.walkerId);
      const walkerSnap = await tx.get(walkerRef);

      const updated: WalkRequest = {
        ...existing,
        status: 'confirmed',
        rating,
        ratingComment: comment,
        updatedAt: Date.now(),
      };
      tx.set(requestRef, walkRequestToDocument(updated), { merge: true });

      if (walkerSnap.exists()) {
        const walker = documentToWalker(
          walkerSnap.data() as Parameters<typeof documentToWalker>[0]
        );
        const next = applyReviewToWalker(
          walker,
          buildWalkerReview(existing, rating, comment)
        );
        tx.update(walkerRef, {
          reviews: next.reviews,
          reviewsCount: next.reviewsCount,
          rating: next.rating,
          updatedAt: Date.now(),
        });
      }
      return updated;
    });
  }
}
