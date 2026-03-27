import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import { DOMAIN_CONSTANTS } from '@/constants/DOMAIN_CONSTANTS';
import SkillRadarChart from '@/components/skill/SkillRadarChart';
import DailySurveyCard from '@/components/survey/DailySurveyCard';
import { BookSurveyService } from '@/services/BookSurveyService';
import { getDomainLabel } from '@/constants/DOMAIN_OPTIONS';

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
  const [{ radarData, gapSkills, lastAssessedAt, hasAssessment }, learningStats, dailyBook, user] =
    await Promise.all([
      getSkillData(userId),
      getLearningStats(userId),
      bookSurveyService.getDailyBook(userId),
      prisma.user.findUnique({ where: { id: userId }, select: { domain: true } }),
    ]);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
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
