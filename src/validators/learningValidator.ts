import { z } from 'zod';
import { skillIdSchema } from './skillValidator';

export const learningItemCreateSchema = z.object({
  type: z.enum(['article', 'book']),
  articleId: z.string().optional(),
  bookId: z.string().optional(),
  skillIds: z.array(skillIdSchema).min(1),
});

export const learningItemUpdateSchema = z.object({
  status: z.enum(['queued', 'completed']),
  memo: z.string().max(5000).optional(),
  skillIds: z.array(skillIdSchema).min(1).optional(),
});

export type LearningItemCreateInput = z.infer<typeof learningItemCreateSchema>;
export type LearningItemUpdateInput = z.infer<typeof learningItemUpdateSchema>;
