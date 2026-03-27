import { prisma } from '@/lib/prisma';
import { DOMAIN_CONSTANTS } from '@/constants/DOMAIN_CONSTANTS';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import type { Article } from '@/types/article';
import { ArticleCard } from './ArticleCard';

type Props = {
  userId: string;
  queuedArticleIds: Set<string>;
};

async function getGapSkillIds(userId: string): Promise<SkillId[]> {
  const allSkillIds = Object.values(SKILL_FRAMEWORK).flatMap((s) => s.map((x) => x.id));
  const assessments = await prisma.skillAssessment.findMany({
    where: { userId, skillId: { in: allSkillIds } },
    orderBy: { assessedAt: 'desc' },
  });

  const latest: Record<string, number> = {};
  for (const a of assessments) {
    if (!latest[a.skillId]) latest[a.skillId] = a.score;
  }

  return Object.entries(latest)
    .filter(([, score]) => score <= DOMAIN_CONSTANTS.GAP_THRESHOLD)
    .map(([skillId]) => skillId as SkillId);
}

export default async function RecommendedArticles({ userId, queuedArticleIds }: Props) {
  const gapSkillIds = await getGapSkillIds(userId);
  if (gapSkillIds.length === 0) return null;

  const recentArticles = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 100,
  });

  const recommended = recentArticles
    .filter((a) => (a.tags as string[]).some((tag) => gapSkillIds.includes(tag as SkillId)))
    .slice(0, 5)
    .map((a) => ({ ...a, tags: a.tags as SkillId[], difficulty: a.difficulty as Article['difficulty'], category: a.category as Article['category'] }));

  if (recommended.length === 0) return null;

  const sourceIds = [...new Set(recommended.map((a) => a.sourceId))];
  const sources = await prisma.articleSource.findMany({
    where: { id: { in: sourceIds } },
    select: { id: true, name: true },
  });
  const sourceNameMap = new Map(sources.map((s) => [s.id, s.name]));

  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        ⭐ あなたへのおすすめ
        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#6b7280' }}>
          ギャップスキルに関連する記事
        </span>
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {recommended.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            sourceName={sourceNameMap.get(article.sourceId) ?? ''}
            isQueued={queuedArticleIds.has(article.id)}
          />
        ))}
      </div>
      <hr style={{ borderColor: '#e5e7eb', marginBottom: '1.5rem' }} />
    </section>
  );
}
