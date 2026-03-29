import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK } from '@/constants/SKILL_FRAMEWORK';
import SkillRadarChart from '@/components/skill/SkillRadarChart';
import DailySurveyCard from '@/components/survey/DailySurveyCard';
import { BookSurveyService } from '@/services/BookSurveyService';
import { getDomainLabel } from '@/constants/DOMAIN_OPTIONS';
import { CATEGORY_LABELS } from '@/constants/FEED_LABELS';
import type { ArticleCategory } from '@/types/article';

const AREA_LABELS: Record<keyof typeof SKILL_FRAMEWORK, string> = {
  people_analytics: 'People Analytics',
  organizational_development: '組織開発',
  strategic_hr: '戦略人事',
};

async function getSkillData(userId: string) {
  const assessments = await prisma.skillAssessment.findMany({
    where: { userId },
    orderBy: { assessedAt: 'desc' },
  });

  const latestBySkill: Record<string, { score: number; assessedAt: Date }> = {};
  for (const a of assessments) {
    if (!latestBySkill[a.skillId]) {
      latestBySkill[a.skillId] = { score: a.score, assessedAt: a.assessedAt };
    }
  }

  const lastAssessedAt = assessments[0]?.assessedAt ?? null;

  const radarData = (Object.keys(SKILL_FRAMEWORK) as (keyof typeof SKILL_FRAMEWORK)[]).map(
    (area) => {
      const skills = SKILL_FRAMEWORK[area];
      const scores = skills
        .map((s) => latestBySkill[s.id]?.score)
        .filter((s): s is number => s !== undefined);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return { area: AREA_LABELS[area], score: Math.round(avg * 10) / 10 };
    }
  );

  const hasAssessment = Object.keys(latestBySkill).length > 0;

  return { radarData, lastAssessedAt, hasAssessment };
}

async function getLearningStats(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [completedCount, memoCount, thisMonthCount] = await Promise.all([
    prisma.learningItem.count({ where: { userId, status: 'completed' } }),
    prisma.learningItem.count({ where: { userId, status: 'completed', memo: { not: null } } }),
    prisma.learningItem.count({ where: { userId, status: 'completed', completedAt: { gte: startOfMonth } } }),
  ]);

  return { completedCount, memoCount, thisMonthCount };
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const bookSurveyService = new BookSurveyService();
  const [
    { radarData, lastAssessedAt, hasAssessment },
    learningStats,
    dailyBook,
    user,
    recentArticles,
    recentBooks,
    queuedItems,
  ] = await Promise.all([
    getSkillData(userId),
    getLearningStats(userId),
    bookSurveyService.getDailyBook(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { domain: true } }),
    prisma.article.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: { id: true, title: true, url: true, category: true, publishedAt: true },
    }),
    prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, author: true, isbn: true, claudeSkillTags: true },
    }),
    prisma.learningItem.findMany({
      where: { userId, status: 'queued' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        article: { select: { id: true, title: true, url: true } },
        book: { select: { id: true, title: true, author: true } },
      },
    }),
  ]);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>ダッシュボード</h1>
          {user?.domain && (
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.125rem' }}>
              専門領域: {getDomainLabel(user.domain)}
            </p>
          )}
        </div>
        <Link
          href="/skill-assessment"
          style={{ padding: '0.5rem 1rem', background: '#1a1a1a', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: '0.875rem' }}
        >
          {hasAssessment ? '評価を更新する' : 'スキルを評価する'}
        </Link>
      </div>

      {/* 学習統計 */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: '読了数', value: learningStats.completedCount, unit: '件' },
          { label: '今月の読了', value: learningStats.thisMonthCount, unit: '件' },
          { label: 'メモ数', value: learningStats.memoCount, unit: '件' },
        ].map(({ label, value, unit }) => (
          <div key={label} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8, textAlign: 'center', background: '#fff' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{label}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
              {value}<span style={{ fontSize: '0.875rem', fontWeight: 'normal', marginLeft: '0.25rem' }}>{unit}</span>
            </p>
          </div>
        ))}
      </section>

      {/* 毎日書籍アンケート */}
      {dailyBook && <DailySurveyCard book={dailyBook} />}

      {/* スキルマップ + 情報フィード */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'start' }}>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold' }}>スキルマップ</h2>
            {lastAssessedAt && (
              <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{lastAssessedAt.toLocaleDateString('ja-JP')}</span>
            )}
          </div>
          {hasAssessment ? (
            <SkillRadarChart data={radarData} />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0.5rem', background: '#f5f5f5', borderRadius: 8 }}>
              <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.75rem' }}>未評価</p>
              <Link href="/skill-assessment" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: '#1a1a1a', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>
                評価する
              </Link>
            </div>
          )}
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold' }}>情報フィード</h2>
            <Link href="/feed" style={{ fontSize: '0.75rem', color: '#6b7280', textDecoration: 'none' }}>もっと見る →</Link>
          </div>
          {recentArticles.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>記事がまだありません。</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentArticles.map((article) => (
                <div key={article.id} style={{ padding: '0.625rem 0.75rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                  <a href={article.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111', textDecoration: 'none', display: 'block', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                    {article.title}
                  </a>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{new Date(article.publishedAt).toLocaleDateString('ja-JP')}</span>
                    <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.375rem', background: '#f3f4f6', borderRadius: 3, color: '#6b7280' }}>
                      {CATEGORY_LABELS[article.category as ArticleCategory] ?? article.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 書籍ランキング + 学習キュー */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'start' }}>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold' }}>書籍ランキング</h2>
            <Link href="/books" style={{ fontSize: '0.75rem', color: '#6b7280', textDecoration: 'none' }}>もっと見る →</Link>
          </div>
          {recentBooks.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>書籍がまだありません。</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentBooks.map((book) => (
                <div key={book.id} style={{ padding: '0.625rem 0.75rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.125rem', lineHeight: 1.4 }}>{book.title}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>{book.author}</span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <a href={book.isbn ? `https://books.rakuten.co.jp/rb/${book.isbn}/` : `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(book.title)}/`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '0.65rem', padding: '0.1rem 0.375rem', borderRadius: 3, background: '#bf0000', color: '#fff', textDecoration: 'none' }}>
                        楽天
                      </a>
                      <a href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(book.isbn ?? book.title)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '0.65rem', padding: '0.1rem 0.375rem', borderRadius: 3, background: '#ff9900', color: '#000', textDecoration: 'none' }}>
                        Amazon
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold' }}>学習キュー</h2>
            <Link href="/queue" style={{ fontSize: '0.75rem', color: '#6b7280', textDecoration: 'none' }}>もっと見る →</Link>
          </div>
          {queuedItems.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>キューが空です。</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {queuedItems.map((item) => {
                const title = item.article?.title ?? item.book?.title ?? '（タイトル不明）';
                const url = item.article?.url;
                return (
                  <div key={item.id} style={{ padding: '0.625rem 0.75rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111', textDecoration: 'none', display: 'block', marginBottom: '0.125rem', lineHeight: 1.4 }}>
                        {title}
                      </a>
                    ) : (
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.125rem', lineHeight: 1.4 }}>{title}</p>
                    )}
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                      {item.type === 'article' ? '記事' : '書籍'} · {item.createdAt.toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
