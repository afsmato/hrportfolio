import type { SkillId, SkillArea } from '@/constants/SKILL_FRAMEWORK';

export type { SkillId, SkillArea };

export interface PortfolioData {
  userId: string;
  userName: string;
  domain: string;
  updatedAt: Date;
  skillRadar: SkillRadarPoint[];
  completedArticleCount: number;
  completedBookCount: number;
  memoCount: number;
  topSkills: TopSkill[];
}

export interface SkillRadarPoint {
  skillId: SkillId;
  label: string;
  area: SkillArea;
  score: number;
}

export interface TopSkill {
  skillId: SkillId;
  label: string;
  area: SkillArea;
  recentItemCount: number;
}

export type NotificationType = 'review_reminder' | 'survey';

export interface NotificationLog {
  id: string;
  userId: string;
  type: NotificationType;
  sent: boolean;
  sentAt?: Date;
  surveyed?: boolean;
  createdAt: Date;
}

export interface TrendReport {
  id: string;
  generatedAt: Date;
  periodFrom: Date;
  periodTo: Date;
  keywords: TrendKeyword[];
}

export interface TrendKeyword {
  id: string;
  trendReportId: string;
  rank: number;
  keyword: string;
  relatedSkillIds: SkillId[];
  articleCount: number;
}
