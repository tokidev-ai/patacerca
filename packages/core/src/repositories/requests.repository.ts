import { WalkRequest, WalkRequestStatus } from '../models/walk-request.model';
import { PetSize } from '../models/owner.model';

export interface CreateWalkRequestInput {
  ownerPhone: string;
  ownerName: string;
  ownerZone: string;
  dogName: string;
  dogSize: PetSize;
  walkerId: string;
  walkerName: string;
  durationMinutes: 30 | 60;
  dayText: string;
  timeText: string;
  note?: string;
  price: number;
}

export interface IRequestsRepository {
  getRequestsByOwner(ownerPhone: string): Promise<WalkRequest[]>;
  getRequestsByWalker(walkerId: string): Promise<WalkRequest[]>;
  getRequestById(requestId: string): Promise<WalkRequest | null>;
  createRequest(input: CreateWalkRequestInput): Promise<WalkRequest>;
  updateRequestStatus(requestId: string, status: WalkRequestStatus): Promise<WalkRequest>;
  rateCompletedWalk(requestId: string, rating: number, comment?: string): Promise<WalkRequest>;
}

