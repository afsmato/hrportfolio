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
      take: 5,
      select: { id: true, title: true, url: true, category: true, publishedAt: true },
    }),
    prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, author: true, isbn: true, claudeSkillTags: true },
    }),
    prisma.learningItem.findMany({
      where: { userId, status: 'queued' },
      orderBy: { createdAt: 'desc' },
      take: 5,
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

      {/* スキルマップ */}
      {hasAssessment ? (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>スキルマップ</h2>
            {lastAssessedAt && (
              <span style={{ fontSize: '0.8rem', color: '#888' }}>
                最終評価: {lastAssessedAt.toLocaleDateString('ja-JP')}
              </span>
            )}
          </div>
          <SkillRadarChart data={radarData} />
        </section>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f5f5f5', borderRadius: 12, marginBottom: '2rem' }}>
          <p style={{ marginBottom: '1rem', color: '#555' }}>スキルマップがまだ作成されていません。</p>
          <Link
            href="/skill-assessment"
            style={{ padding: '0.75rem 1.5rem', background: '#1a1a1a', color: '#fff', borderRadius: 8, textDecoration: 'none' }}
          >
            スキルを評価する
          </Link>
        </div>
      )}

      {/* 情報フィード */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>情報フィード</h2>
          <Link href="/feed" style={{ fontSize: '0.8rem', color: '#6b7280', textDecoration: 'none' }}>
            もっと見る →
          </Link>
        </div>
        {recentArticles.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>記事がまだありません。</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentArticles.map((article) => (
              <div key={article.id} style={{ padding: '0.75rem 1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', textDecoration: 'none', flex: 1 }}
                  >
                    {article.title}
                  </a>
                  <span style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem', background: '#f3f4f6', borderRadius: 4, color: '#6b7280', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {CATEGORY_LABELS[article.category as ArticleCategory] ?? article.category}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 書籍ランキング */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>書籍ランキング</h2>
          <Link href="/books" style={{ fontSize: '0.8rem', color: '#6b7280', textDecoration: 'none' }}>
            もっと見る →
          </Link>
        </div>
        {recentBooks.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>書籍がまだありません。</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentBooks.map((book) => (
              <div key={book.id} style={{ padding: '0.75rem 1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.125rem' }}>{book.title}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{book.author}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                  <a
                    href={book.isbn ? `https://books.rakuten.co.jp/rb/${book.isbn}/` : `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(book.title)}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: 4, background: '#bf0000', color: '#fff', textDecoration: 'none' }}
                  >
                    楽天
                  </a>
                  <a
                    href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(book.isbn ?? book.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: 4, background: '#ff9900', color: '#000', textDecoration: 'none' }}
                  >
                    Amazon
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 学習キュー */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>学習キュー</h2>
          <Link href="/queue" style={{ fontSize: '0.8rem', color: '#6b7280', textDecoration: 'none' }}>
            もっと見る →
          </Link>
        </div>
        {queuedItems.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>キューに追加されたアイテムがありません。</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {queuedItems.map((item) => {
              const title = item.article?.title ?? item.book?.title ?? '（タイトル不明）';
              const url = item.article?.url;
              return (
                <div key={item.id} style={{ padding: '0.75rem 1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', textDecoration: 'none' }}>
                        {title}
                      </a>
                    ) : (
                      <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{title}</p>
                    )}
                    <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.125rem' }}>
                      {item.type === 'article' ? '記事' : '書籍'} · 追加日: {item.createdAt.toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', background: '#f3f4f6', borderRadius: 4, color: '#6b7280', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    未読
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
