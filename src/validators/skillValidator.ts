import { z } from 'zod';
import { SKILL_FRAMEWORK } from '@/constants/SKILL_FRAMEWORK';

const allSkillIds = Object.values(SKILL_FRAMEWORK)
  .flat()
  .map((s) => s.id) as [string, ...string[]];

export const skillIdSchema = z.enum(allSkillIds);

export const skillAssessmentSchema = z.object({
  skillId: skillIdSchema,
  score: z.number().int().min(1).max(5),
  note: z.string().max(500).optional(),
});

export type SkillAssessmentInput = z.infer<typeof skillAssessmentSchema>;
