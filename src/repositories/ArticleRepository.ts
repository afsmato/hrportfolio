import { prisma } from '@/lib/prisma';
import type { Article, ArticleCategory, ArticleDifficulty } from '@/types/article';
import type { SkillId } from '@/constants/SKILL_FRAMEWORK';

export interface ArticleCreateInput {
  sourceId: string;
  title: string;
  url: string;
  summary: string;
  publishedAt: Date;
  tags: SkillId[];
  difficulty: ArticleDifficulty;
  category: ArticleCategory;
}

export interface ArticleFindParams {
  category?: ArticleCategory;
  difficulty?: ArticleDifficulty;
  page?: number;
  pageSize?: number;
}

function toArticle(record: {
  id: string;
  sourceId: string;
  title: string;
  url: string;
  summary: string;
  publishedAt: Date;
  tags: unknown;
  difficulty: string;
  category: string;
  fetchedAt: Date;
}): Article {
  return {
    ...record,
    tags: record.tags as SkillId[],
    difficulty: record.difficulty as ArticleDifficulty,
    category: record.category as ArticleCategory,
  };
}

export class ArticleRepository {
  async upsertMany(articles: ArticleCreateInput[]): Promise<number> {
    let count = 0;
    for (const article of articles) {
      await prisma.article.upsert({
        where: { url: article.url },
        update: {},
        create: {
          sourceId: article.sourceId,
          title: article.title,
          url: article.url,
          summary: article.summary,
          publishedAt: article.publishedAt,
          tags: article.tags,
          difficulty: article.difficulty,
          category: article.category,
        },
      });
      count++;
    }
    return count;
  }

  async findMany(params: ArticleFindParams = {}): Promise<{ articles: Article[]; total: number }> {
    const { category, difficulty, page = 1, pageSize = 20 } = params;

    const where = {
      ...(category ? { category } : {}),
      ...(difficulty ? { difficulty } : {}),
    };

    const [records, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    return { articles: records.map(toArticle), total };
  }
}
