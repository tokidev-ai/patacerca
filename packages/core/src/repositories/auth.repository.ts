import { APP_STRINGS } from '../constants/strings.constant';
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
  /** Motivo cuando el código no sirve (para mostrar el mensaje correcto). */
  error?: 'invalid' | 'expired' | 'too-many-requests';
}

/** Mensajes de `Error` que lanza `sendOtp` (SMS real). */
export const OTP_ERRORS = {
  tooManyRequests: 'OTP_TOO_MANY_REQUESTS',
  invalidPhone: 'OTP_INVALID_PHONE',
  quotaExceeded: 'OTP_QUOTA_EXCEEDED',
  sendFailed: 'OTP_SEND_FAILED',
} as const;

export interface RegisterCredentialsInput {
  /** Ya normalizado con `normalizeEmail`. */
  email: string;
  password: string;
  /** Teléfono (8 dígitos) verificado con OTP; enlaza la cuenta con el perfil. */
  phone: string;
  role: UserRole;
}

/** Mensaje del error que lanza `registerCredentials` si el correo ya existe. */
export const EMAIL_TAKEN_ERROR = 'EMAIL_TAKEN';

export function isEmailTakenError(error: unknown): boolean {
  return error instanceof Error && error.message === EMAIL_TAKEN_ERROR;
}

export interface IAuthRepository {
  sendOtp(phone: string): Promise<boolean>;
  verifyOtp(phone: string, code: string, role: UserRole): Promise<VerifyOtpResult>;
  /** Crea la cuenta de login (correo + contraseña). Lanza `EMAIL_TAKEN` si el correo ya existe. */
  registerCredentials(input: RegisterCredentialsInput): Promise<void>;
  /** Valida correo + contraseña. Devuelve el teléfono del perfil, o `null` si son incorrectos. */
  loginWithEmail(email: string, password: string, role: UserRole): Promise<string | null>;
  getCurrentSession(): Promise<SessionUser | null>;
  saveSession(user: SessionUser): Promise<void>;
  logout(): Promise<void>;
}

/** Mensaje para el usuario según el error de `sendOtp`. */
export function otpSendErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : '';
  if (msg === OTP_ERRORS.tooManyRequests || msg === OTP_ERRORS.quotaExceeded) {
    return APP_STRINGS.errors.otpTooManyRequests;
  }
  if (msg === OTP_ERRORS.invalidPhone) return APP_STRINGS.errors.invalidBolivianPhone;
  if (msg === OTP_ERRORS.sendFailed) return APP_STRINGS.errors.otpSendFailed;
  return APP_STRINGS.errors.authFailed;
}

/** Mensaje para el usuario cuando `verifyOtp` no acepta el código. */
export function otpVerifyErrorMessage(result: VerifyOtpResult): string {
  if (result.error === 'expired') return APP_STRINGS.errors.otpExpired;
  if (result.error === 'too-many-requests') return APP_STRINGS.errors.otpTooManyRequests;
  return APP_STRINGS.errors.invalidOtp;
}
