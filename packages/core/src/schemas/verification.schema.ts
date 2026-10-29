import { z } from 'zod';
import { cleanBolivianPhone, isValidBolivianPhone } from '../rules/formatting.rule';
import { APP_STRINGS } from '../constants/strings.constant';

export const step1Schema = z.object({
  nationalIdNumber: z
    .string()
    .trim()
    .min(5, { message: APP_STRINGS.errors.missingVerificationStep1 }),
  idFrontUploaded: z.literal(true, {
    errorMap: () => ({ message: APP_STRINGS.errors.missingVerificationStep1 }),
  }),
  idBackUploaded: z.literal(true, {
    errorMap: () => ({ message: APP_STRINGS.errors.missingVerificationStep1 }),
  }),
  selfieUploaded: z.literal(true, {
    errorMap: () => ({ message: APP_STRINGS.errors.missingVerificationStep1 }),
  }),
});

export const step2Schema = z.object({
  policeRecordUploaded: z.literal(true, {
    errorMap: () => ({ message: APP_STRINGS.errors.missingVerificationStep2 }),
  }),
});

export const step3Schema = z.object({
  ref1Name: z.string().trim().min(2, { message: APP_STRINGS.errors.missingVerificationStep3 }),
  ref1Phone: z
    .string()
    .transform(cleanBolivianPhone)
    .refine(isValidBolivianPhone, {
      message: APP_STRINGS.errors.missingVerificationStep3,
    }),
  ref2Name: z.string().trim().min(2, { message: APP_STRINGS.errors.missingVerificationStep3 }),
  ref2Phone: z
    .string()
    .transform(cleanBolivianPhone)
    .refine(isValidBolivianPhone, {
      message: APP_STRINGS.errors.missingVerificationStep3,
    }),
});

export const step4Schema = z.object({
  interviewSlot: z
    .string()
    .min(1, { message: APP_STRINGS.errors.missingVerificationStep4 }),
});

