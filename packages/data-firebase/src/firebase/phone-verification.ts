/**
 * Verificación de teléfono por SMS con Firebase Phone Auth (SDK nativo
 * `@react-native-firebase/auth`). Solo se usa para comprobar que el número es del
 * usuario: tras confirmar, se cierra esa sesión nativa. Firestore, Storage y el login con
 * correo siguen en el SDK web (`firebase/*`).
 *
 * Se importa de forma dinámica para que el modo mock siga funcionando en Expo Go, donde
 * el módulo nativo no existe.
 */
import { OTP_ERRORS } from '@patacerca/core';

type NativeAuthModule = typeof import('@react-native-firebase/auth');
type ConfirmationResult = Awaited<ReturnType<NativeAuthModule['signInWithPhoneNumber']>>;

/** Una confirmación pendiente por teléfono (8 dígitos). */
const pending = new Map<string, ConfirmationResult>();

function toE164(phone8: string): string {
  return `+591${phone8}`;
}

function errorCode(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : '';
}

async function loadNativeAuth(): Promise<NativeAuthModule> {
  return import('@react-native-firebase/auth');
}

/** Envía el SMS. Lanza `Error(OTP_ERRORS.*)` con un motivo legible por la UI. */
export async function sendPhoneVerificationCode(phone8: string): Promise<void> {
  const { getAuth, signInWithPhoneNumber } = await loadNativeAuth();
  try {
    const confirmation = await signInWithPhoneNumber(getAuth(), toE164(phone8));
    pending.set(phone8, confirmation);
  } catch (error) {
    const code = errorCode(error);
    const detail =
      error instanceof Error
        ? `${error.message} ${JSON.stringify((error as { userInfo?: unknown }).userInfo ?? {})}`
        : String(error);
    console.warn('[sms] no se pudo enviar el código:', code || 'sin código', detail);
    if (code === 'auth/too-many-requests') throw new Error(OTP_ERRORS.tooManyRequests);
    if (code === 'auth/invalid-phone-number') throw new Error(OTP_ERRORS.invalidPhone);
    if (code === 'auth/quota-exceeded') throw new Error(OTP_ERRORS.quotaExceeded);
    throw new Error(OTP_ERRORS.sendFailed);
  }
}

export type PhoneCodeResult = 'valid' | 'invalid' | 'expired' | 'too-many-requests';

/** Confirma el código del SMS. Si es válido, cierra la sesión nativa (solo era una prueba). */
export async function confirmPhoneVerificationCode(
  phone8: string,
  code: string
): Promise<PhoneCodeResult> {
  const { getAuth, signOut } = await loadNativeAuth();
  const auth = getAuth();
  const confirmation = pending.get(phone8);
  if (!confirmation) return 'expired';

  try {
    await confirmation.confirm(code.trim());
  } catch (error) {
    const reason = errorCode(error);
    // Android puede verificar solo leyendo el SMS: en ese caso ya hay sesión con ese número.
    const autoVerified = auth.currentUser?.phoneNumber === toE164(phone8);
    if (!autoVerified) {
      if (reason === 'auth/session-expired' || reason === 'auth/code-expired')
        return 'expired';
      if (reason === 'auth/too-many-requests') return 'too-many-requests';
      return 'invalid';
    }
  }

  pending.delete(phone8);
  await signOut(auth).catch(() => {});
  return 'valid';
}
