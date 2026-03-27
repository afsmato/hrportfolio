import Link from 'next/link';
import { auth } from '@/auth';
import { PortfolioService } from '@/services/PortfolioService';
import { DOMAIN_CONSTANTS } from '@/constants/DOMAIN_CONSTANTS';
import SkillRadarChart from '@/components/skill/SkillRadarChart';

export default async function PortfolioPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const service = new PortfolioService();
  const { radarData, lastAssessedAt, hasAssessment, gapSkills, stats, focusSkills, certifications } =
    await service.getPortfolioData(userId);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>スキルポートフォリオ</h1>
        {lastAssessedAt && (
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            最終更新: {lastAssessedAt.toLocaleDateString('ja-JP')}
          </span>
        )}
      </div>

      {/* 学習サマリカード */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: '読了記事数', value: stats.completedArticles, unit: '件' },
          { label: '読了書籍数', value: stats.completedBooks, unit: '冊' },
          { label: '振り返りメモ', value: stats.memoCount, unit: '件' },
        ].map(({ label, value, unit }) => (
          <div key={label} style={{ padding: '1.25rem', border: '1px solid #e5e7eb', borderRadius: 10, textAlign: 'center', background: '#fff' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.375rem' }}>{label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>
              {value}
              <span style={{ fontSize: '0.875rem', fontWeight: 'normal', marginLeft: '0.25rem' }}>{unit}</span>
            </p>
          </div>
        ))}
      </section>

      {!hasAssessment ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f9fafb', borderRadius: 12, marginBottom: '2rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>スキルマップがまだ作成されていません。</p>
          <Link
            href="/skill-assessment"
            style={{ padding: '0.75rem 1.5rem', background: '#1a1a1a', color: '#fff', borderRadius: 8, textDecoration: 'none' }}
          >
            スキルを評価する
          </Link>
        </div>
      ) : (
        <>
          {/* スキルレーダーチャート */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>スキルマップ</h2>
            <SkillRadarChart data={radarData} />
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <Link href="/skill-assessment" style={{ fontSize: '0.8rem', color: '#6b7280', textDecoration: 'underline' }}>
                評価を更新する
              </Link>
            </div>
          </section>

          {/* 注力スキル（直近3ヶ月） */}
          {focusSkills.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                注力スキル
                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '0.5rem' }}>
                  （直近3ヶ月・Top3）
                </span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {focusSkills.map((skill, i) => (
                  <div key={skill.skillId} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8 }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a', width: 24, textAlign: 'center' }}>
                      {i + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: '0.9rem' }}>{skill.label}</span>
                    <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>{skill.count}件の学習</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ギャップスキル */}
          {gapSkills.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                ギャップスキル
                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '0.5rem' }}>
                  （スコア {DOMAIN_CONSTANTS.GAP_THRESHOLD} 以下）
                </span>
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {gapSkills.map((skill) => (
                  <li key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#fff8f0', border: '1px solid #fbbf24', borderRadius: 8 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#92400e', marginRight: '0.5rem' }}>{skill.area}</span>
                      <span style={{ fontSize: '0.9rem' }}>{skill.label}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#d97706' }}>{skill.score} / 5</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {/* 取得済み資格 */}
      {certifications.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>取得済み資格・コース</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {certifications.map((cert, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8 }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#15803d', marginRight: '0.5rem' }}>{cert.provider}</span>
                  <span style={{ fontSize: '0.9rem' }}>{cert.name}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {cert.completedAt.toLocaleDateString('ja-JP')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* クイックリンク */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
        {[
          { href: '/feed', label: '情報フィードを見る' },
          { href: '/books', label: '書籍ランキングを見る' },
          { href: '/queue', label: '学習キューを確認する' },
          { href: '/skill-assessment', label: 'スキルを再評価する' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.875rem', textAlign: 'center', background: '#fff' }}
          >
            {label}
          </Link>
        ))}
      </section>
    </main>
  );
}
