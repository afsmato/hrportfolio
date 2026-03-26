import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import { DOMAIN_CONSTANTS } from '@/constants/DOMAIN_CONSTANTS';
import SkillRadarChart from '@/components/skill/SkillRadarChart';

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

  // skillIdごとに最新を取得
  const latestBySkill: Record<string, { score: number; assessedAt: Date }> = {};
  for (const a of assessments) {
    if (!latestBySkill[a.skillId]) {
      latestBySkill[a.skillId] = { score: a.score, assessedAt: a.assessedAt };
    }
  }

  // 最終評価日
  const lastAssessedAt = assessments[0]?.assessedAt ?? null;

  // 領域ごとの平均スコア
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

  // ギャップスキル（評価済みかつスコア≤GAP_THRESHOLD）
  const gapSkills = (Object.keys(SKILL_FRAMEWORK) as (keyof typeof SKILL_FRAMEWORK)[]).flatMap(
    (area) =>
      SKILL_FRAMEWORK[area]
        .filter((s) => {
          const score = latestBySkill[s.id as SkillId]?.score;
          return score !== undefined && score <= DOMAIN_CONSTANTS.GAP_THRESHOLD;
        })
        .map((s) => ({ ...s, area: AREA_LABELS[area], score: latestBySkill[s.id as SkillId]!.score }))
  );

  const hasAssessment = Object.keys(latestBySkill).length > 0;

  return { radarData, gapSkills, lastAssessedAt, hasAssessment };
}

export default async function DashboardPage() {
  const session = await auth();
  const { radarData, gapSkills, lastAssessedAt, hasAssessment } = await getSkillData(
    session!.user!.id!
  );

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>ダッシュボード</h1>
        <Link
          href="/skill-assessment"
          style={{ padding: '0.5rem 1rem', background: '#1a1a1a', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: '0.875rem' }}
        >
          {hasAssessment ? '評価を更新する' : 'スキルを評価する'}
        </Link>
      </div>

      {!hasAssessment ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f5f5f5', borderRadius: 12 }}>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            スキルマップがまだ作成されていません。
          </p>
          <Link
            href="/skill-assessment"
            style={{ padding: '0.75rem 1.5rem', background: '#1a1a1a', color: '#fff', borderRadius: 8, textDecoration: 'none' }}
          >
            スキルを評価する
          </Link>
        </div>
      ) : (
        <>
          {/* レーダーチャート */}
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

          {/* ギャップスキル */}
          {gapSkills.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                ギャップスキル
                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#888', marginLeft: '0.5rem' }}>
                  （スコア {DOMAIN_CONSTANTS.GAP_THRESHOLD} 以下）
                </span>
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {gapSkills.map((skill) => (
                  <li key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#fff8f0', border: '1px solid #ffa500', borderRadius: 8 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#888', marginRight: '0.5rem' }}>{skill.area}</span>
                      <span>{skill.label}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#e65c00' }}>
                      {skill.score} / 5
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
