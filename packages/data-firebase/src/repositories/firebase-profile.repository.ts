import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  FS_COLLECTIONS,
  type IProfileRepository,
  type Owner,
  type Pet,
  type Walker,
} from '@patacerca/core';
import { getFirestoreDb } from '../firebase/app';
import {
  documentToOwner,
  ownerToDocument,
  walkerToDocument,
} from '../firebase/mappers';
import { findWalkerByIdOrPhone } from '../firebase/walker-lookup';

export class FirebaseProfileRepository implements IProfileRepository {
  async getOwnerProfile(phone: string): Promise<Owner | null> {
    const snap = await getDoc(doc(getFirestoreDb(), FS_COLLECTIONS.owners, phone));
    if (!snap.exists()) return null;
    return documentToOwner(snap.data() as Parameters<typeof documentToOwner>[0]);
  }

  async saveOwnerProfile(owner: Owner): Promise<Owner> {
    const payload = ownerToDocument(owner);
    await setDoc(doc(getFirestoreDb(), FS_COLLECTIONS.owners, owner.phone), payload, {
      merge: true,
    });
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
    return this.saveOwnerProfile(updated);
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
    return this.saveOwnerProfile(updated);
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
    return this.saveOwnerProfile(updated);
  }

  async getWalkerProfile(walkerIdOrPhone: string): Promise<Walker | null> {
    return findWalkerByIdOrPhone(walkerIdOrPhone);
  }

  async saveWalkerProfile(walker: Walker): Promise<Walker> {
    const payload = walkerToDocument(walker);
    await setDoc(doc(getFirestoreDb(), FS_COLLECTIONS.walkers, walker.id), payload, {
      merge: true,
    });
    return walker;
  }
}
