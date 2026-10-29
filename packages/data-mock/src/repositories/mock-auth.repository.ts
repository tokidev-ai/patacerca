import { IAuthRepository, SessionUser, UserRole } from '@patacerca/core';
import { mockStorage } from '../storage/mock-storage';

const SESSION_STORAGE_KEY = '@patacerca:session';

export class MockAuthRepository implements IAuthRepository {
  async sendOtp(_phone: string): Promise<boolean> {
    // In mock, code is always 1234
    return true;
  }

  async verifyOtp(phone: string, code: string, role: UserRole): Promise<{ exists: boolean; user?: SessionUser }> {
    if (code !== '1234') {
      return { exists: false };
    }

    // Check if user already has an existing profile
    const profileKey = role === 'owner' ? `@patacerca:owner:${phone}` : `@patacerca:walker:${phone}`;
    const existing = await mockStorage.getItem<any | null>(profileKey, null);

    if (existing) {
      const sessionUser: SessionUser = {
        phone,
        role,
        ownerData: role === 'owner' ? existing : undefined,
        walkerData: role === 'walker' ? existing : undefined,
      };
      await this.saveSession(sessionUser);
      return { exists: true, user: sessionUser };
    }

    return { exists: false };
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

