import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import { DOMAIN_CONSTANTS } from '@/constants/DOMAIN_CONSTANTS';

const AREA_LABELS: Record<keyof typeof SKILL_FRAMEWORK, string> = {
  people_analytics: 'People Analytics',
  organizational_development: '組織開発',
  strategic_hr: '戦略人事',
};

const SKILL_LABEL_MAP: Record<string, string> = Object.values(SKILL_FRAMEWORK)
  .flat()
  .reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {});

export interface PortfolioData {
  radarData: { area: string; score: number }[];
  lastAssessedAt: Date | null;
  hasAssessment: boolean;
  gapSkills: { id: string; label: string; area: string; score: number }[];
  stats: {
    completedArticles: number;
    completedBooks: number;
    memoCount: number;
  };
  focusSkills: { skillId: string; label: string; count: number }[];
  certifications: { name: string; provider: string; completedAt: Date }[];
}

export class PortfolioService {
  async getPortfolioData(userId: string): Promise<PortfolioData> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [assessments, completedItems, userCerts] = await Promise.all([
      prisma.skillAssessment.findMany({
        where: { userId },
        orderBy: { assessedAt: 'desc' },
      }),
      prisma.learningItem.findMany({
        where: { userId, status: 'completed' },
        select: { type: true, memo: true, skillIds: true, completedAt: true },
      }),
      prisma.userCertification.findMany({
        where: { userId, status: 'completed' },
        include: { certification: { select: { name: true, provider: true } } },
        orderBy: { completedAt: 'desc' },
      }),
    ]);

    // スキル評価: skillIdごとに最新を取得
    const latestBySkill: Record<string, { score: number; assessedAt: Date }> = {};
    for (const a of assessments) {
      if (!latestBySkill[a.skillId]) {
        latestBySkill[a.skillId] = { score: a.score, assessedAt: a.assessedAt };
      }
    }

    const hasAssessment = Object.keys(latestBySkill).length > 0;
    const lastAssessedAt = assessments[0]?.assessedAt ?? null;

    // レーダーチャートデータ
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

    // ギャップスキル
    const gapSkills = (Object.keys(SKILL_FRAMEWORK) as (keyof typeof SKILL_FRAMEWORK)[]).flatMap(
      (area) =>
        SKILL_FRAMEWORK[area]
          .filter((s) => {
            const score = latestBySkill[s.id as SkillId]?.score;
            return score !== undefined && score <= DOMAIN_CONSTANTS.GAP_THRESHOLD;
          })
          .map((s) => ({
            id: s.id,
            label: s.label,
            area: AREA_LABELS[area],
            score: latestBySkill[s.id as SkillId]!.score,
          }))
    );

    // 学習統計
    const stats = {
      completedArticles: completedItems.filter((i) => i.type === 'article').length,
      completedBooks: completedItems.filter((i) => i.type === 'book').length,
      memoCount: completedItems.filter((i) => i.memo).length,
    };

    // 注力スキル（直近90日のTop3）
    const recentItems = completedItems.filter(
      (i) => i.completedAt && i.completedAt >= ninetyDaysAgo
    );
    const skillCount: Record<string, number> = {};
    for (const item of recentItems) {
      for (const sid of item.skillIds as string[]) {
        skillCount[sid] = (skillCount[sid] ?? 0) + 1;
      }
    }
    const focusSkills = Object.entries(skillCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([skillId, count]) => ({
        skillId,
        label: SKILL_LABEL_MAP[skillId] ?? skillId,
        count,
      }));

    const certifications = userCerts.map((uc) => ({
      name: uc.certification.name,
      provider: uc.certification.provider,
      completedAt: uc.completedAt ?? uc.updatedAt,
    }));

    return { radarData, lastAssessedAt, hasAssessment, gapSkills, stats, focusSkills, certifications };
  }
}
