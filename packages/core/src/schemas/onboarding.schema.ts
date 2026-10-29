import { z } from 'zod';
import { APP_STRINGS } from '../constants/strings.constant';

export const ownerOnboardingSchema = z.object({
  name: z.string().trim().min(2, { message: APP_STRINGS.errors.missingOwnerFields }),
  zone: z.string().min(1),
  dogName: z.string().trim().min(1, { message: APP_STRINGS.errors.missingOwnerFields }),
  dogSize: z.enum(['small', 'medium', 'large']),
});

export type OwnerOnboardingFormData = z.infer<typeof ownerOnboardingSchema>;

export const walkerOnboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .refine((val) => val.split(/\s+/).filter(Boolean).length >= 2, {
      message: APP_STRINGS.errors.missingWalkerFields,
    }),
  zone: z.string().min(1),
});

export type WalkerOnboardingFormData = z.infer<typeof walkerOnboardingSchema>;

