import { z } from 'zod';
import { cleanBolivianPhone, isValidBolivianPhone } from '../rules/formatting.rule';
import { APP_STRINGS } from '../constants/strings.constant';

export const phoneSchema = z.object({
  phone: z
    .string()
    .transform(cleanBolivianPhone)
    .refine(isValidBolivianPhone, {
      message: APP_STRINGS.errors.invalidBolivianPhone,
    }),
});

export type PhoneFormData = z.infer<typeof phoneSchema>;

export const otpSchema = z.object({
  code: z
    .string()
    .length(4, { message: APP_STRINGS.errors.invalidOtp })
    .refine((val) => val === '1234', {
      message: APP_STRINGS.errors.invalidOtp,
    }),
});

export type OtpFormData = z.infer<typeof otpSchema>;

