import { claude } from '@/lib/claude';
import { fetchRssFeed, type RssItem } from '@/lib/rss';
import { ArticleRepository, type ArticleCreateInput } from '@/repositories/ArticleRepository';
import { ARTICLE_SOURCES, type ArticleCategory } from '@/constants/ARTICLE_SOURCES';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import type { ArticleDifficulty } from '@/types/article';
import { prisma } from '@/lib/prisma';

const ALL_SKILL_IDS: SkillId[] = Object.values(SKILL_FRAMEWORK).flatMap((skills) =>
  skills.map((s) => s.id as SkillId)
);

export interface ArticleAnalysis {
  summary: string;
  tags: SkillId[];
  difficulty: ArticleDifficulty;
}

export class FeedService {
  private repository = new ArticleRepository();

  async analyzeArticle(
    item: RssItem,
    sourceName: string,
    category: ArticleCategory
  ): Promise<ArticleAnalysis> {
    const prompt = `記事タイトル: ${item.title}
記事概要: ${item.contentSnippet ?? '(概要なし)'}
情報ソース: ${sourceName} (${category})

以下をJSON形式で返してください:
{
  "summary": "日本語要約（100〜200字）",
  "tags": ["skill_id_1", "skill_id_2"],
  "difficulty": "beginner|practical|advanced|expert"
}

tagsは次のスキルIDから最大3つ選択: ${ALL_SKILL_IDS.join(', ')}
difficultyは必ず beginner, practical, advanced, expert のいずれかにすること。
JSONのみを返し、説明文は不要。`;

    const message = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Claude returned no JSON for article: ${item.title}`);
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      summary?: string;
      tags?: unknown[];
      difficulty?: string;
    };

    const validDifficulties: ArticleDifficulty[] = ['beginner', 'practical', 'advanced', 'expert'];
    const difficulty: ArticleDifficulty = validDifficulties.includes(
      parsed.difficulty as ArticleDifficulty
    )
      ? (parsed.difficulty as ArticleDifficulty)
      : 'practical';

    const tags: SkillId[] = (parsed.tags ?? [])
      .filter((t): t is SkillId => ALL_SKILL_IDS.includes(t as SkillId))
      .slice(0, 3);

    return {
      summary: parsed.summary ?? '',
      tags,
      difficulty,
    };
  }

  async fetchAndStore(): Promise<{ fetched: number; errors: number }> {
    let fetched = 0;
    let errors = 0;

    const dbSources = await prisma.articleSource.findMany({ where: { active: true } });
    const sourceMap = new Map(dbSources.map((s) => [s.id, s]));
    const activeSources = ARTICLE_SOURCES.filter((s) => sourceMap.has(s.id));

    for (const source of activeSources) {
      let items: RssItem[] = [];
      try {
        items = await fetchRssFeed(source.url);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`[FeedService] fetchRssFeed failed for ${source.name}:`, err);
        errors++;
        continue;
      }

      const toInsert: ArticleCreateInput[] = [];
      for (const item of items.slice(0, 3)) {
        if (!item.link) continue;
        try {
          const analysis = await this.analyzeArticle(item, source.name, source.category);
          toInsert.push({
            sourceId: source.id,
            title: item.title ?? '',
            url: item.link,
            summary: analysis.summary,
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
            tags: analysis.tags,
            difficulty: analysis.difficulty,
            category: source.category,
          });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(`[FeedService] analyzeArticle failed for "${item.title}":`, err);
          errors++;
        }
      }

      if (toInsert.length > 0) {
        const count = await this.repository.upsertMany(toInsert);
        fetched += count;
      }
    }

    return { fetched, errors };
  }
}
