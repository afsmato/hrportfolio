import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import { CAREER_PATHS } from '@/constants/CAREER_PATHS';
import CareerGoalSelector from '@/components/roadmap/CareerGoalSelector';

const SKILL_LABEL_MAP: Record<string, string> = Object.values(SKILL_FRAMEWORK)
  .flat()
  .reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {});

export default async function RoadmapPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [user, assessments] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { careerGoal: true } }),
    prisma.skillAssessment.findMany({ where: { userId }, orderBy: { assessedAt: 'desc' } }),
  ]);

  // 最新スキルスコア
  const latestScores: Record<string, number> = {};
  for (const a of assessments) {
    if (!(a.skillId in latestScores)) latestScores[a.skillId] = a.score;
  }

  const selectedPath = CAREER_PATHS.find((p) => p.id === user?.careerGoal) ?? null;

  // ギャップ計算
  const skillGaps = selectedPath
    ? (Object.entries(selectedPath.requiredSkills) as [SkillId, number][])
        .map(([skillId, required]) => ({
          skillId,
          label: SKILL_LABEL_MAP[skillId] ?? skillId,
          current: latestScores[skillId] ?? 0,
          required,
          gap: Math.max(0, required - (latestScores[skillId] ?? 0)),
          isKey: selectedPath.keySkills.includes(skillId),
        }))
        .sort((a, b) => b.gap - a.gap || (b.isKey ? 1 : 0) - (a.isKey ? 1 : 0))
    : [];

  const gapSkills = skillGaps.filter((s) => s.gap > 0);
  const achievedSkills = skillGaps.filter((s) => s.gap === 0);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>キャリアロードマップ</h1>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
          目標キャリアへのスキルギャップを確認する
        </p>
      </div>

      {/* 目標キャリア選択 */}
      <section style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>目標キャリア</h2>
        <CareerGoalSelector currentGoal={user?.careerGoal ?? null} />
        {selectedPath && (
          <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: 8, marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{selectedPath.label}</p>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.125rem' }}>{selectedPath.description}</p>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {selectedPath.keySkills.map((sid) => (
                <span key={sid} style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 4, color: '#92400e' }}>
                  ★ {SKILL_LABEL_MAP[sid]}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {selectedPath && (
        <>
          {/* ギャップスキル */}
          {gapSkills.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                強化が必要なスキル
                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '0.5rem' }}>
                  ({gapSkills.length}件)
                </span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {gapSkills.map((skill) => (
                  <div key={skill.skillId} style={{ padding: '0.875rem 1rem', border: '1px solid #fecaca', borderRadius: 8, background: '#fff5f5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        {skill.isKey && <span style={{ fontSize: '0.7rem', color: '#d97706' }}>★</span>}
                        <span style={{ fontSize: '0.875rem', fontWeight: skill.isKey ? 'bold' : 'normal' }}>{skill.label}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 'bold' }}>
                        {skill.current} → {skill.required} (+{skill.gap})
                      </span>
                    </div>
                    {/* プログレスバー */}
                    <div style={{ height: 6, background: '#fee2e2', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          background: '#ef4444',
                          borderRadius: 3,
                          width: `${(skill.current / 5) * 100}%`,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>現在: {skill.current}/5</span>
                      <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>目標: {skill.required}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 達成済みスキル */}
          {achievedSkills.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: '#15803d' }}>
                達成済みスキル ✓
                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '0.5rem' }}>
                  ({achievedSkills.length}件)
                </span>
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {achievedSkills.map((skill) => (
                  <span key={skill.skillId} style={{ padding: '0.375rem 0.75rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, fontSize: '0.8rem', color: '#15803d' }}>
                    ✓ {skill.label} ({skill.current}/5)
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* クイックリンク */}
          <section style={{ padding: '1rem', background: '#f9fafb', borderRadius: 8 }}>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.625rem' }}>ギャップを埋める学習アクション</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link href="/feed" style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: 6, textDecoration: 'none', color: '#374151', fontSize: '0.8rem', background: '#fff' }}>
                関連記事を読む
              </Link>
              <Link href="/books" style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: 6, textDecoration: 'none', color: '#374151', fontSize: '0.8rem', background: '#fff' }}>
                書籍を探す
              </Link>
              <Link href="/classics" style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: 6, textDecoration: 'none', color: '#374151', fontSize: '0.8rem', background: '#fff' }}>
                名著を探す
              </Link>
            </div>
          </section>
        </>
      )}

      {!selectedPath && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f9fafb', borderRadius: 12 }}>
          <p style={{ color: '#6b7280' }}>目標キャリアを選択すると、スキルギャップが表示されます。</p>
        </div>
      )}
    </main>
  );
}
