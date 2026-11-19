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
