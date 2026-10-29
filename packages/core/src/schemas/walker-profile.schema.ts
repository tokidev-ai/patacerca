import { z } from 'zod';

export const walkerProfileSchema = z.object({
  bio: z.string().max(400).optional(),
  price30: z.number().min(15).max(30),
  zones: z.array(z.string()).min(1),
  days: z.array(z.string()).min(1),
  timeSlots: z.array(z.string()).min(1),
  travelCare: z.boolean(),
});

export type WalkerProfileFormData = z.infer<typeof walkerProfileSchema>;

