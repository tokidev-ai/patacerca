import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  FS_COLLECTIONS,
  type CreateWalkRequestInput,
  type IRequestsRepository,
  type WalkRequest,
  type WalkRequestStatus,
} from '@patacerca/core';
import { getFirestoreDb } from '../firebase/app';
import { documentToWalkRequest, walkRequestToDocument } from '../firebase/mappers';

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
    const existing = await this.getRequestById(requestId);
    if (!existing) throw new Error('Request not found');
    const updated: WalkRequest = {
      ...existing,
      rating,
      ratingComment: comment,
      updatedAt: Date.now(),
    };
    await setDoc(
      doc(getFirestoreDb(), FS_COLLECTIONS.walkRequests, requestId),
      walkRequestToDocument(updated),
      { merge: true }
    );
    return updated;
  }
}
