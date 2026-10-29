import {
  IRequestsRepository,
  CreateWalkRequestInput,
  WalkRequest,
  WalkRequestStatus,
} from '@patacerca/core';
import { mockStorage } from '../storage/mock-storage';
import { INITIAL_REQUESTS } from '../seeds/requests.seed';

const REQUESTS_STORAGE_KEY = '@patacerca:requests';

export class MockRequestsRepository implements IRequestsRepository {
  private async getStoredRequests(): Promise<WalkRequest[]> {
    const stored = await mockStorage.getItem<WalkRequest[]>(REQUESTS_STORAGE_KEY, []);
    if (stored.length === 0) {
      await mockStorage.setItem(REQUESTS_STORAGE_KEY, INITIAL_REQUESTS);
      return INITIAL_REQUESTS;
    }
    return stored;
  }

  async getRequestsByOwner(ownerPhone: string): Promise<WalkRequest[]> {
    const list = await this.getStoredRequests();
    return list
      .filter((r) => r.ownerPhone === ownerPhone)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getRequestsByWalker(walkerId: string): Promise<WalkRequest[]> {
    const list = await this.getStoredRequests();
    return list
      .filter((r) => r.walkerId === walkerId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getRequestById(requestId: string): Promise<WalkRequest | null> {
    const list = await this.getStoredRequests();
    return list.find((r) => r.id === requestId) || null;
  }

  async createRequest(input: CreateWalkRequestInput): Promise<WalkRequest> {
    const list = await this.getStoredRequests();
    const newRequest: WalkRequest = {
      id: `req_${Date.now()}`,
      ...input,
      status: 'pending',
      createdAt: Date.now(),
    };
    list.unshift(newRequest);
    await mockStorage.setItem(REQUESTS_STORAGE_KEY, list);
    return newRequest;
  }

  async updateRequestStatus(
    requestId: string,
    status: WalkRequestStatus
  ): Promise<WalkRequest> {
    const list = await this.getStoredRequests();
    const index = list.findIndex((r) => r.id === requestId);
    if (index === -1) {
      throw new Error(`Request ${requestId} not found`);
    }
    const updated: WalkRequest = {
      ...list[index]!,
      status,
      updatedAt: Date.now(),
    };
    list[index] = updated;
    await mockStorage.setItem(REQUESTS_STORAGE_KEY, list);
    return updated;
  }

  async rateCompletedWalk(
    requestId: string,
    rating: number,
    comment?: string
  ): Promise<WalkRequest> {
    const list = await this.getStoredRequests();
    const index = list.findIndex((r) => r.id === requestId);
    if (index === -1) {
      throw new Error(`Request ${requestId} not found`);
    }
    const updated: WalkRequest = {
      ...list[index]!,
      status: 'confirmed',
      rating,
      ratingComment: comment,
      updatedAt: Date.now(),
    };
    list[index] = updated;
    await mockStorage.setItem(REQUESTS_STORAGE_KEY, list);
    return updated;
  }
}

