import { z } from 'zod';
import { skillIdSchema } from './skillValidator';

export const bookSearchSchema = z.object({
  keyword: z.string().min(1).max(100),
  page: z.number().int().min(1).default(1),
});

export const bookSurveyResponseSchema = z.object({
  bookId: z.string().min(1),
  response: z.enum(['read', 'queued', 'skipped']),
  skillIds: z.array(skillIdSchema).optional().default([]),
  skillLevelAtRead: z.number().int().min(1).max(5).optional(),
});

export type BookSearchInput = z.infer<typeof bookSearchSchema>;
export type BookSurveyResponseInput = z.infer<typeof bookSurveyResponseSchema>;
