import { Walker } from '../models/walker.model';

export interface WalkerFilters {
  zone?: string;
  query?: string;
  availableToday?: boolean;
  acceptsLargeDogs?: boolean;
  travelCare?: boolean;
  maxPrice?: number;
}

export interface IWalkersRepository {
  getWalkers(filters?: WalkerFilters): Promise<Walker[]>;
  getWalkerById(id: string): Promise<Walker | null>;
  updateWalkerProfile(id: string, updates: Partial<Walker>): Promise<Walker>;
}

