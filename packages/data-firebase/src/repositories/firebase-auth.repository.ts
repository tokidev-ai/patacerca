import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  FS_COLLECTIONS,
  type UserAccountDocument,
  EMAIL_TAKEN_ERROR,
  type RegisterCredentialsInput,
  type OwnerDocument,
  cleanBolivianPhone,
  type IAuthRepository,
  type SessionUser,
  type UserRole,
  type VerifyOtpResult,
} from '@patacerca/core';
import { getFirebaseAuth, getFirestoreDb } from '../firebase/app';
import { documentToOwner } from '../firebase/mappers';
import { findWalkerByIdOrPhone } from '../firebase/walker-lookup';
import {
  confirmPhoneVerificationCode,
  sendPhoneVerificationCode,
} from '../firebase/phone-verification';

const SESSION_STORAGE_KEY = '@patacerca:session';

function authErrorCode(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : '';
}

const INVALID_LOGIN_CODES = new Set([
  'auth/invalid-credential',
  'auth/invalid-email',
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/user-disabled',
]);

export class FirebaseAuthRepository implements IAuthRepository {
  /** Envía el SMS real con Firebase Phone Auth. Lanza `Error(OTP_ERRORS.*)`. */
  async sendOtp(phone: string): Promise<boolean> {
    await sendPhoneVerificationCode(cleanBolivianPhone(phone));
    return true;
  }

  async verifyOtp(phone: string, code: string, role: UserRole): Promise<VerifyOtpResult> {
    const cleaned = cleanBolivianPhone(phone);
    const db = getFirestoreDb();

    const result = await confirmPhoneVerificationCode(cleaned, code);
    if (result !== 'valid') {
      return { exists: false, otpValid: false, error: result };
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

  async registerCredentials(input: RegisterCredentialsInput): Promise<void> {
    try {
      const cred = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        input.email,
        input.password
      );
      const account: UserAccountDocument = {
        email: input.email,
        phone: cleanBolivianPhone(input.phone),
        role: input.role,
        createdAt: Date.now(),
      };
      await setDoc(
        doc(getFirestoreDb(), FS_COLLECTIONS.userAccounts, cred.user.uid),
        account
      );
    } catch (error) {
      if (authErrorCode(error) === 'auth/email-already-in-use') {
        throw new Error(EMAIL_TAKEN_ERROR);
      }
      throw error;
    }
  }

  async loginWithEmail(
    email: string,
    password: string,
    role: UserRole
  ): Promise<string | null> {
    try {
      const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      const snap = await getDoc(
        doc(getFirestoreDb(), FS_COLLECTIONS.userAccounts, cred.user.uid)
      );
      const account = snap.exists() ? (snap.data() as UserAccountDocument) : null;
      if (!account || account.role !== role) {
        await signOut(getFirebaseAuth());
        return null;
      }
      return account.phone;
    } catch (error) {
      if (INVALID_LOGIN_CODES.has(authErrorCode(error))) return null;
      throw error;
    }
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
    await signOut(getFirebaseAuth()).catch(() => {});
  }
}
