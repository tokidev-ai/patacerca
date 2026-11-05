import {
  IAuthRepository,
  SessionUser,
  UserRole,
  type VerifyOtpResult,
  type Walker,
} from '@patacerca/core';
import { mockStorage } from '../storage/mock-storage';
import { INITIAL_WALKERS } from '../seeds/walkers.seed';

const WALKERS_LIST_KEY = '@patacerca:walkers';

async function findMockWalkerByPhone(phone: string): Promise<Walker | null> {
  const list = await mockStorage.getItem<Walker[]>(WALKERS_LIST_KEY, INITIAL_WALKERS);
  return list.find((w) => w.phone === phone) ?? null;
}

const SESSION_STORAGE_KEY = '@patacerca:session';

export class MockAuthRepository implements IAuthRepository {
  async sendOtp(_phone: string): Promise<boolean> {
    // In mock, code is always 1234
    return true;
  }

  async verifyOtp(
    phone: string,
    code: string,
    role: UserRole
  ): Promise<VerifyOtpResult> {
    if (code !== '1234') {
      return { exists: false, otpValid: false };
    }

    if (role === 'owner') {
      const existing = await mockStorage.getItem<any | null>(
        `@patacerca:owner:${phone}`,
        null
      );
      if (existing) {
        const sessionUser: SessionUser = { phone, role, ownerData: existing };
        await this.saveSession(sessionUser);
        return { exists: true, user: sessionUser };
      }
      return { exists: false, otpValid: true };
    }

    const walker = await findMockWalkerByPhone(phone);
    if (walker) {
      const sessionUser: SessionUser = { phone, role, walkerData: walker };
      await this.saveSession(sessionUser);
      return { exists: true, user: sessionUser };
    }

    return { exists: false, otpValid: true };
  }

  async getCurrentSession(): Promise<SessionUser | null> {
    return mockStorage.getItem<SessionUser | null>(SESSION_STORAGE_KEY, null);
  }

  async saveSession(user: SessionUser): Promise<void> {
    await mockStorage.setItem(SESSION_STORAGE_KEY, user);
  }

  async logout(): Promise<void> {
    await mockStorage.removeItem(SESSION_STORAGE_KEY);
  }
}
