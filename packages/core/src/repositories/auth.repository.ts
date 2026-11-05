import { Owner } from '../models/owner.model';
import { Walker } from '../models/walker.model';

export type UserRole = 'owner' | 'walker';

export interface SessionUser {
  phone: string;
  role: UserRole;
  ownerData?: Owner;
  walkerData?: Walker;
}

export interface VerifyOtpResult {
  exists: boolean;
  user?: SessionUser;
  /** OTP correcto pero aún no hay perfil (ir a onboarding). */
  otpValid?: boolean;
}

export interface IAuthRepository {
  sendOtp(phone: string): Promise<boolean>;
  verifyOtp(phone: string, code: string, role: UserRole): Promise<VerifyOtpResult>;
  getCurrentSession(): Promise<SessionUser | null>;
  saveSession(user: SessionUser): Promise<void>;
  logout(): Promise<void>;
}
