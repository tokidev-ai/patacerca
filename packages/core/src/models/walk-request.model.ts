import { PetSize } from './owner.model';

export type WalkRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'confirmed';

export interface WalkRequest {
  id: string;
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
  status: WalkRequestStatus;
  rating?: number;
  ratingComment?: string;
  createdAt: number;
  updatedAt?: number;
}

