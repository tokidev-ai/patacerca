import {
  EMAIL_TAKEN_ERROR,
  IAuthRepository,
  type RegisterCredentialsInput,
  SessionUser,
  UserRole,
  type VerifyOtpResult,
  type Walker,
} from '@patacerca/core';
import { mockStorage } from '../storage/mock-storage';
import { INITIAL_WALKERS } from '../seeds/walkers.seed';
import { DEMO_PASSWORD, INITIAL_OWNERS } from '../seeds/owners.seed';

const WALKERS_LIST_KEY = '@patacerca:walkers';

async function findMockWalkerByPhone(phone: string): Promise<Walker | null> {
  const list = await mockStorage.getItem<Walker[]>(WALKERS_LIST_KEY, INITIAL_WALKERS);
  return list.find((w) => w.phone === phone) ?? null;
}

const SESSION_STORAGE_KEY = '@patacerca:session';

interface MockCredential {
  phone: string;
  /** Solo mock: en producción la contraseña la gestiona Firebase Auth. */
  password: string;
}

const credentialKey = (role: UserRole, email: string) =>
  `@patacerca:credentials:${role}:${email}`;

/** Cuentas demo: los seeds con `email` entran con DEMO_PASSWORD. */
function findDemoPhone(role: UserRole, email: string): string | null {
  const seed =
    role === 'owner'
      ? INITIAL_OWNERS.find((o) => o.email === email)
      : INITIAL_WALKERS.find((w) => w.email === email);
  return seed?.phone ?? null;
}

export class MockAuthRepository implements IAuthRepository {
  async sendOtp(_phone: string): Promise<boolean> {
    // In mock, code is always 1234
    return true;
  }

  async verifyOtp(phone: string, code: string, role: UserRole): Promise<VerifyOtpResult> {
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

  async registerCredentials(input: RegisterCredentialsInput): Promise<void> {
    const key = credentialKey(input.role, input.email);
    const existing = await mockStorage.getItem<MockCredential | null>(key, null);
    if (existing || findDemoPhone(input.role, input.email)) {
      throw new Error(EMAIL_TAKEN_ERROR);
    }
    await mockStorage.setItem<MockCredential>(key, {
      phone: input.phone,
      password: input.password,
    });
  }

  async loginWithEmail(
    email: string,
    password: string,
    role: UserRole
  ): Promise<string | null> {
    const stored = await mockStorage.getItem<MockCredential | null>(
      credentialKey(role, email),
      null
    );
    if (stored) {
      return stored.password === password ? stored.phone : null;
    }
    const demoPhone = findDemoPhone(role, email);
    return demoPhone && password === DEMO_PASSWORD ? demoPhone : null;
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
