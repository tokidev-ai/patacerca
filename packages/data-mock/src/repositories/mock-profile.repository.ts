import { IProfileRepository, Owner, Walker, Pet } from '@patacerca/core';
import { mockStorage } from '../storage/mock-storage';

export class MockProfileRepository implements IProfileRepository {
  private getOwnerKey(phone: string): string {
    return `@patacerca:owner:${phone}`;
  }

  private getWalkerKey(walkerId: string): string {
    return `@patacerca:walker:${walkerId}`;
  }

  async getOwnerProfile(phone: string): Promise<Owner | null> {
    return mockStorage.getItem<Owner | null>(this.getOwnerKey(phone), null);
  }

  async saveOwnerProfile(owner: Owner): Promise<Owner> {
    await mockStorage.setItem(this.getOwnerKey(owner.phone), owner);
    return owner;
  }

  async addPetToOwner(phone: string, pet: Pet): Promise<Owner> {
    const owner = await this.getOwnerProfile(phone);
    if (!owner) throw new Error('Owner not found');
    const pets = owner.pets ? [...owner.pets, pet] : [pet];
    const updated: Owner = {
      ...owner,
      pets,
    };
    await this.saveOwnerProfile(updated);
    return updated;
  }

  async getWalkerProfile(walkerId: string): Promise<Walker | null> {
    return mockStorage.getItem<Walker | null>(this.getWalkerKey(walkerId), null);
  }

  async saveWalkerProfile(walker: Walker): Promise<Walker> {
    await mockStorage.setItem(this.getWalkerKey(walker.id), walker);
    return walker;
  }
}

