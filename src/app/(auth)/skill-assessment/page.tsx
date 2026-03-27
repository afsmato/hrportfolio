import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import SkillAssessmentForm from '@/components/skill/SkillAssessmentForm';

async function getLatestAssessments(userId: string): Promise<Partial<Record<SkillId, number>>> {
  const allSkillIds = Object.values(SKILL_FRAMEWORK).flatMap((skills) =>
    skills.map((s) => s.id)
  );

  const assessments = await prisma.skillAssessment.findMany({
    where: { userId, skillId: { in: allSkillIds } },
    orderBy: { assessedAt: 'desc' },
  });

  const latest: Partial<Record<SkillId, number>> = {};
  for (const a of assessments) {
    if (!latest[a.skillId as SkillId]) {
      latest[a.skillId as SkillId] = a.score;
    }
  }
  return latest;
}

export default async function SkillAssessmentPage() {
  const session = await auth();
  const defaultValues = session?.user?.id
    ? await getLatestAssessments(session.user.id)
    : {};

  return <SkillAssessmentForm defaultValues={defaultValues} previousValues={defaultValues} />;
}
