import type { SkillId } from '@/constants/SKILL_FRAMEWORK';
import type { ArticleCategory } from '@/constants/ARTICLE_SOURCES';

export type { ArticleCategory };

export type ArticleDifficulty = 'beginner' | 'practical' | 'advanced' | 'expert';

export interface ArticleSource {
  id: string;
  name: string;
  url: string;
  category: ArticleCategory;
  active: boolean;
}

export interface Article {
  id: string;
  sourceId: string;
  title: string;
  url: string;
  summary: string;
  publishedAt: Date;
  tags: SkillId[];
  difficulty: ArticleDifficulty;
  category: ArticleCategory;
  fetchedAt: Date;
}
