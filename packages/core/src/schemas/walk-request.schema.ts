import { z } from 'zod';
import { APP_STRINGS } from '../constants/strings.constant';

export const walkRequestSchema = z.object({
  durationMinutes: z.union([z.literal(30), z.literal(60)]),
  dayText: z.string().min(1),
  timeText: z.string().min(1, { message: APP_STRINGS.errors.missingTimeSlot }),
  note: z.string().max(250).optional(),
});

export type WalkRequestFormData = z.infer<typeof walkRequestSchema>;

