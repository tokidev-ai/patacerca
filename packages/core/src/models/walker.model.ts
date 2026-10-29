export type WalkerStatus = 'pending' | 'in_review' | 'approved';

export interface WalkerReview {
  id: string;
  authorName: string;
  zone: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Walker {
  id: string;
  phone: string;
  name: string;
  zone: string;
  distanceText: string;
  rating: number;
  reviewsCount: number;
  price30: number;
  price60: number;
  availableToday: boolean;
  acceptsLargeDogs: boolean;
  travelCare: boolean;
  colorName: string;
  bio: string;
  reviews: WalkerReview[];
  status: WalkerStatus;
  zones: string[];
  days: string[];
  timeSlots: string[];
}

