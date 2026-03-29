import { Suspense } from 'react';
import { auth } from '@/auth';
import { ArticleRepository } from '@/repositories/ArticleRepository';
import { prisma } from '@/lib/prisma';
import { ArticleCard } from '@/components/feed/ArticleCard';
import { FilterBar } from '@/components/feed/FilterBar';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import { DOMAIN_CONSTANTS } from '@/constants/DOMAIN_CONSTANTS';
import type { ArticleCategory, ArticleDifficulty } from '@/types/article';

interface SearchParams {
  category?: string;
  difficulty?: string;
  page?: string;
}

async function getRecommendedArticleIds(userId: string): Promise<Set<string>> {
  const allSkillIds = Object.values(SKILL_FRAMEWORK).flatMap((s) => s.map((x) => x.id));
  const assessments = await prisma.skillAssessment.findMany({
    where: { userId, skillId: { in: allSkillIds } },
    orderBy: { assessedAt: 'desc' },
  });

  const latest: Record<string, number> = {};
  for (const a of assessments) {
    if (!latest[a.skillId]) latest[a.skillId] = a.score;
  }

  const gapSkillIds = Object.entries(latest)
    .filter(([, score]) => score <= DOMAIN_CONSTANTS.GAP_THRESHOLD)
    .map(([skillId]) => skillId as SkillId);

  if (gapSkillIds.length === 0) return new Set();

  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 100,
    select: { id: true, tags: true },
  });

  return new Set(
    articles
      .filter((a) => (a.tags as string[]).some((tag) => gapSkillIds.includes(tag as SkillId)))
      .map((a) => a.id)
  );
}

async function ArticleList({
  searchParams,
  queuedArticleIds,
  recommendedArticleIds,
}: {
  searchParams: SearchParams;
  queuedArticleIds: Set<string>;
  recommendedArticleIds: Set<string>;
}) {
  const category = searchParams.category as ArticleCategory | undefined;
  const difficulty = searchParams.difficulty as ArticleDifficulty | undefined;
  const page = Math.max(1, Number(searchParams.page ?? '1'));

  const repository = new ArticleRepository();
  const { articles, total } = await repository.findMany({ category, difficulty, page });

  const sourceIds = [...new Set(articles.map((a) => a.sourceId))];
  const sources = await prisma.articleSource.findMany({
    where: { id: { in: sourceIds } },
    select: { id: true, name: true },
  });
  const sourceNameMap = new Map(sources.map((s) => [s.id, s.name]));

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  if (articles.length === 0) {
    return (
      <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem 0' }}>
        記事がありません。フィルターを変更するか、後ほど再度ご確認ください。
      </p>
    );
  }

  return (
    <>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        {total} 件中 {(page - 1) * pageSize + 1}〜{Math.min(page * pageSize, total)} 件を表示
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            sourceName={sourceNameMap.get(article.sourceId) ?? ''}
            isQueued={queuedArticleIds.has(article.id)}
            isRecommended={recommendedArticleIds.has(article.id)}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {page > 1 && (
            <a
              href={`/feed?${new URLSearchParams({ ...(category ? { category } : {}), ...(difficulty ? { difficulty } : {}), page: String(page - 1) })}`}
              style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', textDecoration: 'none', color: '#374151' }}
            >
              前へ
            </a>
          )}
          <span style={{ padding: '0.5rem 1rem', color: '#6b7280' }}>
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/feed?${new URLSearchParams({ ...(category ? { category } : {}), ...(difficulty ? { difficulty } : {}), page: String(page + 1) })}`}
              style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', textDecoration: 'none', color: '#374151' }}
            >
              次へ
            </a>
          )}
        </div>
      )}
    </>
  );
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, session] = await Promise.all([searchParams, auth()]);
  const userId = session?.user?.id ?? '';

  const [queuedItems, recommendedArticleIds] = await Promise.all([
    userId
      ? prisma.learningItem.findMany({
          where: { userId, type: 'article', status: 'queued' },
          select: { articleId: true },
        })
      : Promise.resolve([]),
    userId ? getRecommendedArticleIds(userId) : Promise.resolve(new Set<string>()),
  ]);
  const queuedArticleIds = new Set(queuedItems.map((i) => i.articleId).filter(Boolean) as string[]);

  return (
    <main style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>情報フィード</h1>

      <Suspense>
        <FilterBar />
      </Suspense>

      <Suspense fallback={<p style={{ color: '#6b7280' }}>読み込み中...</p>}>
        <ArticleList
          searchParams={params}
          queuedArticleIds={queuedArticleIds}
          recommendedArticleIds={recommendedArticleIds}
        />
      </Suspense>
    </main>
  );
}
