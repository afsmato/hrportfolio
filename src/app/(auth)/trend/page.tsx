import Link from 'next/link';
import { auth } from '@/auth';
import { TrendService } from '@/services/TrendService';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';

const SKILL_LABEL_MAP: Record<string, string> = Object.values(SKILL_FRAMEWORK)
  .flat()
  .reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {});

export default async function TrendPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const trendService = new TrendService();
  const [report, assessments] = await Promise.all([
    trendService.getLatestReport(),
    prisma.skillAssessment.findMany({
      where: { userId },
      orderBy: { assessedAt: 'desc' },
    }),
  ]);

  // skillIdごとに最新スコアを取得
  const latestScores: Record<string, number> = {};
  for (const a of assessments) {
    if (!(a.skillId in latestScores)) {
      latestScores[a.skillId] = a.score;
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>トレンドレーダー</h1>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
            HR領域の直近2ヶ月のトレンドキーワード
          </p>
        </div>
        {report && (
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            {report.generatedAt.toLocaleDateString('ja-JP')} 生成
          </span>
        )}
      </div>

      {!report ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f9fafb', borderRadius: 12 }}>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>まだデータがありません。</p>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            毎月1日に記事データから自動生成されます。
          </p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            対象期間: {report.periodFrom.toLocaleDateString('ja-JP')} 〜{' '}
            {report.periodTo.toLocaleDateString('ja-JP')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {report.keywords.map((kw) => (
              <div
                key={kw.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  background: '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                      color: '#6b7280',
                      width: 28,
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {kw.rank}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', flex: 1 }}>{kw.keyword}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {kw.articleCount}件
                  </span>
                  <Link
                    href={`/feed?q=${encodeURIComponent(kw.keyword)}`}
                    style={{
                      fontSize: '0.75rem',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      padding: '0.25rem 0.625rem',
                      border: '1px solid #bfdbfe',
                      borderRadius: 6,
                      flexShrink: 0,
                    }}
                  >
                    記事を見る
                  </Link>
                </div>

                {kw.relatedSkillIds.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', paddingLeft: 40 }}>
                    {kw.relatedSkillIds.map((skillId: SkillId) => {
                      const score = latestScores[skillId];
                      const label = SKILL_LABEL_MAP[skillId] ?? skillId;
                      return (
                        <span
                          key={skillId}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: score !== undefined ? '#f0fdf4' : '#f9fafb',
                            border: `1px solid ${score !== undefined ? '#86efac' : '#e5e7eb'}`,
                            borderRadius: 6,
                            color: score !== undefined ? '#15803d' : '#6b7280',
                          }}
                        >
                          {label}
                          {score !== undefined && (
                            <span style={{ marginLeft: '0.25rem', fontWeight: 'bold' }}>
                              {score}/5
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* クイックリンク */}
      <section style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link
          href="/feed"
          style={{
            padding: '0.625rem 1rem',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#374151',
            fontSize: '0.875rem',
            background: '#fff',
          }}
        >
          情報フィードを見る
        </Link>
        <Link
          href="/portfolio"
          style={{
            padding: '0.625rem 1rem',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#374151',
            fontSize: '0.875rem',
            background: '#fff',
          }}
        >
          スキルポートフォリオ
        </Link>
      </section>
    </main>
  );
}
