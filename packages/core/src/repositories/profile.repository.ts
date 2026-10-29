import { Owner, Pet } from '../models/owner.model';
import { Walker } from '../models/walker.model';

export interface IProfileRepository {
  getOwnerProfile(phone: string): Promise<Owner | null>;
  saveOwnerProfile(owner: Owner): Promise<Owner>;
  addPetToOwner(phone: string, pet: Pet): Promise<Owner>;
  getWalkerProfile(walkerId: string): Promise<Walker | null>;
  saveWalkerProfile(walker: Walker): Promise<Walker>;
}

