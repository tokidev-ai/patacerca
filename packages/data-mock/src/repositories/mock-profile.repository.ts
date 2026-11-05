import { IProfileRepository, Owner, Walker, Pet } from '@patacerca/core';
import { mockStorage } from '../storage/mock-storage';
import { INITIAL_WALKERS } from '../seeds/walkers.seed';

const WALKERS_LIST_KEY = '@patacerca:walkers';

async function findMockWalkerByIdOrPhone(idOrPhone: string): Promise<Walker | null> {
  const key = idOrPhone.trim();
  const stored = await mockStorage.getItem<Walker | null>(`@patacerca:walker:${key}`, null);
  if (stored) return stored;

  const list = await mockStorage.getItem<Walker[]>(WALKERS_LIST_KEY, INITIAL_WALKERS);
  return list.find((w) => w.id === key || w.phone === key) ?? null;
}

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
      dogName: pets[0]?.name ?? owner.dogName,
      dogSize: pets[0]?.size ?? owner.dogSize,
    };
    await this.saveOwnerProfile(updated);
    return updated;
  }

  async updatePetOnOwner(
    phone: string,
    petId: string,
    updates: Partial<Pet>
  ): Promise<Owner> {
    const owner = await this.getOwnerProfile(phone);
    if (!owner) throw new Error('Owner not found');
    const pets = (owner.pets || []).map((p) =>
      p.id === petId ? { ...p, ...updates, id: petId } : p
    );
    if (!pets.some((p) => p.id === petId)) {
      throw new Error('Pet not found');
    }
    const updated: Owner = {
      ...owner,
      pets,
      dogName: pets[0]?.name ?? owner.dogName,
      dogSize: pets[0]?.size ?? owner.dogSize,
    };
    await this.saveOwnerProfile(updated);
    return updated;
  }

  async removePetFromOwner(phone: string, petId: string): Promise<Owner> {
    const owner = await this.getOwnerProfile(phone);
    if (!owner) throw new Error('Owner not found');
    const pets = (owner.pets || []).filter((p) => p.id !== petId);
    if (pets.length === (owner.pets || []).length) {
      throw new Error('Pet not found');
    }
    const updated: Owner = {
      ...owner,
      pets,
      dogName: pets[0]?.name ?? owner.dogName,
      dogSize: pets[0]?.size ?? owner.dogSize,
    };
    await this.saveOwnerProfile(updated);
    return updated;
  }

  async getWalkerProfile(walkerIdOrPhone: string): Promise<Walker | null> {
    return findMockWalkerByIdOrPhone(walkerIdOrPhone);
  }

  async saveWalkerProfile(walker: Walker): Promise<Walker> {
    await mockStorage.setItem(this.getWalkerKey(walker.id), walker);
    return walker;
  }
}
