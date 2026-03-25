import type { SkillId } from '@/constants/SKILL_FRAMEWORK';

export type LearningItemType = 'article' | 'book';
export type LearningItemStatus = 'queued' | 'completed';

export interface LearningItem {
  id: string;
  userId: string;
  type: LearningItemType;
  articleId?: string;
  bookId?: string;
  status: LearningItemStatus;
  skillIds: SkillId[];
  memo?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publishedDate: string;
  imageUrl?: string;
  rakutenItemCode?: string;
  amazonAsin?: string;
  isClassic: boolean;
  claudeSkillTags: SkillId[];
  createdAt: Date;
}

export interface BookSkillTag {
  id: string;
  bookId: string;
  skillId: SkillId;
  count: number;
  avgSkillLevelAtRead: number;
  updatedAt: Date;
}

export type BookSurveyResponseType = 'read' | 'queued' | 'skipped';

export interface BookSurveyResponse {
  id: string;
  userId: string;
  bookId: string;
  response: BookSurveyResponseType;
  skillIds: SkillId[];
  skillLevelAtRead?: number;
  respondedAt: Date;
}
