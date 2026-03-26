'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { SkillId } from '@/constants/SKILL_FRAMEWORK';

export async function saveSkillAssessments(
  scores: Record<SkillId, number>
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;
  const now = new Date();

  await prisma.skillAssessment.createMany({
    data: Object.entries(scores).map(([skillId, score]) => ({
      userId,
      skillId,
      score,
      assessedAt: now,
    })),
  });

  redirect('/dashboard');
}
