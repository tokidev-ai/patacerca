import { IWalkersRepository, Walker, WalkerFilters } from '@patacerca/core';
import { mockStorage } from '../storage/mock-storage';
import { INITIAL_WALKERS } from '../seeds/walkers.seed';

const WALKERS_STORAGE_KEY = '@patacerca:walkers';

export class MockWalkersRepository implements IWalkersRepository {
  private async getStoredWalkers(): Promise<Walker[]> {
    const stored = await mockStorage.getItem<Walker[]>(WALKERS_STORAGE_KEY, []);
    if (stored.length === 0) {
      await mockStorage.setItem(WALKERS_STORAGE_KEY, INITIAL_WALKERS);
      return INITIAL_WALKERS;
    }
    return stored;
  }

  async getWalkers(filters?: WalkerFilters): Promise<Walker[]> {
    const list = await this.getStoredWalkers();
    let result = [...list];

    if (!filters) return result;

    if (filters.query && filters.query.trim().length > 0) {
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

    // Sort by zone matching: walkers in the requested zone come first
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

  async getWalkerById(id: string): Promise<Walker | null> {
    const list = await this.getStoredWalkers();
    return list.find((w) => w.id === id) || null;
  }

  async updateWalkerProfile(id: string, updates: Partial<Walker>): Promise<Walker> {
    const list = await this.getStoredWalkers();
    const index = list.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new Error(`Walker with id ${id} not found`);
    }
    const updated: Walker = {
      ...list[index]!,
      ...updates,
    };
    list[index] = updated;
    await mockStorage.setItem(WALKERS_STORAGE_KEY, list);
    return updated;
  }
}

