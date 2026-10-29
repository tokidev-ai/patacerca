import { VerificationData } from '../models/verification.model';
import { isValidBolivianPhone, cleanBolivianPhone } from './formatting.rule';

export function isStep1Complete(v?: Partial<VerificationData>): boolean {
  if (!v) return false;
  return Boolean(
    v.nationalIdNumber &&
      v.nationalIdNumber.trim().length >= 5 &&
      v.idFrontUploaded &&
      v.idBackUploaded &&
      v.selfieUploaded
  );
}

export function isStep2Complete(v?: Partial<VerificationData>): boolean {
  if (!v) return false;
  return Boolean(v.policeRecordUploaded);
}

export function isStep3Complete(v?: Partial<VerificationData>): boolean {
  if (!v) return false;
  const p1 = cleanBolivianPhone(v.ref1Phone || '');
  const p2 = cleanBolivianPhone(v.ref2Phone || '');
  return Boolean(
    v.ref1Name &&
      v.ref1Name.trim().length >= 2 &&
      isValidBolivianPhone(p1) &&
      v.ref2Name &&
      v.ref2Name.trim().length >= 2 &&
      isValidBolivianPhone(p2)
  );
}

export function isStep4Complete(v?: Partial<VerificationData>): boolean {
  if (!v) return false;
  return Boolean(v.interviewSlot && v.interviewSlot.trim().length > 0);
}

export function getCompletedStepsCount(v?: Partial<VerificationData>): number {
  let count = 0;
  if (isStep1Complete(v)) count++;
  if (isStep2Complete(v)) count++;
  if (isStep3Complete(v)) count++;
  if (isStep4Complete(v)) count++;
  return count;
}

