import type { SkillId, SkillArea } from '@/constants/SKILL_FRAMEWORK';

export type { SkillId, SkillArea };

export interface SkillAssessment {
  id: string;
  userId: string;
  skillId: SkillId;
  score: 1 | 2 | 3 | 4 | 5;
  assessedAt: Date;
  note?: string;
}

export interface SkillWithAssessment {
  skillId: SkillId;
  label: string;
  area: SkillArea;
  score: number | null;
  assessedAt: Date | null;
}

export interface SkillGap {
  skillId: SkillId;
  label: string;
  area: SkillArea;
  score: number;
}
