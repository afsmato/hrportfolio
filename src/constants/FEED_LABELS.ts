import type { ArticleCategory } from './ARTICLE_SOURCES';
import type { ArticleDifficulty } from '@/types/article';

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  people_analytics: 'ピープルアナリティクス',
  organizational_development: '組織開発',
  hr_tech: 'HRテクノロジー',
  domestic_hr: '国内HR',
  management_science: '経営学',
  labor_economics: '労働経済学',
  academic_global: '学術・論文（グローバル）',
  academic_domestic: '学術・論文（国内）',
  hr_consulting_global: 'HRコンサル（グローバル）',
  hr_consulting_domestic: 'HRコンサル（国内）',
};

export const DIFFICULTY_LABELS: Record<ArticleDifficulty, string> = {
  beginner: '入門',
  practical: '実践',
  advanced: '応用',
  expert: '専門',
};
