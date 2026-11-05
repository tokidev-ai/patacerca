import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  FS_COLLECTIONS,
  type OtpSessionDocument,
  type OwnerDocument,
  cleanBolivianPhone,
  getOtpFixedCode,
  getOtpTtlMinutes,
  getAppRoleFromEnv,
  type IAuthRepository,
  type SessionUser,
  type UserRole,
  type VerifyOtpResult,
} from '@patacerca/core';
import { getFirestoreDb } from '../firebase/app';
import { documentToOwner } from '../firebase/mappers';
import { findWalkerByIdOrPhone } from '../firebase/walker-lookup';

const SESSION_STORAGE_KEY = '@patacerca:session';

function generateOtpCode(): string {
  const fixed = getOtpFixedCode();
  if (fixed) return fixed;
  return `${Math.floor(1000 + Math.random() * 9000)}`;
}

export class FirebaseAuthRepository implements IAuthRepository {
  async sendOtp(phone: string): Promise<boolean> {
    return this.sendOtpForRole(phone, getAppRoleFromEnv());
  }

  async sendOtpForRole(phone: string, role: UserRole): Promise<boolean> {
    const cleaned = cleanBolivianPhone(phone);
    const code = generateOtpCode();
    const ttlMs = getOtpTtlMinutes() * 60 * 1000;
    const createdAt = Date.now();

    const payload: OtpSessionDocument = {
      phone: cleaned,
      code,
      role,
      expiresAt: createdAt + ttlMs,
      createdAt,
    };

    const db = getFirestoreDb();
    await setDoc(doc(db, FS_COLLECTIONS.otpSessions, cleaned), payload, { merge: true });
    return true;
  }

  async verifyOtp(
    phone: string,
    code: string,
    role: UserRole
  ): Promise<VerifyOtpResult> {
    const cleaned = cleanBolivianPhone(phone);
    const db = getFirestoreDb();
    const otpSnap = await getDoc(doc(db, FS_COLLECTIONS.otpSessions, cleaned));

    if (!otpSnap.exists()) {
      return { exists: false, otpValid: false };
    }

    const otp = otpSnap.data() as OtpSessionDocument;
    if (otp.expiresAt < Date.now()) {
      return { exists: false, otpValid: false };
    }
    if (otp.code !== code.trim()) {
      return { exists: false, otpValid: false };
    }

    if (role === 'owner') {
      const ownerSnap = await getDoc(doc(db, FS_COLLECTIONS.owners, cleaned));
      if (!ownerSnap.exists()) {
        return { exists: false, otpValid: true };
      }
      const owner = documentToOwner(ownerSnap.data() as OwnerDocument);
      const sessionUser: SessionUser = { phone: cleaned, role, ownerData: owner };
      await this.saveSession(sessionUser);
      return { exists: true, user: sessionUser };
    }

    const walker = await findWalkerByIdOrPhone(cleaned);
    if (walker) {
      const sessionUser: SessionUser = {
        phone: cleaned,
        role,
        walkerData: walker,
      };
      await this.saveSession(sessionUser);
      return { exists: true, user: sessionUser };
    }

    return { exists: false, otpValid: true };
  }

  async getCurrentSession(): Promise<SessionUser | null> {
    const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      return null;
    }
  }

  async saveSession(user: SessionUser): Promise<void> {
    await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  }
}
