'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { SkillId } from '@/constants/SKILL_FRAMEWORK';

export async function respondToSurvey(
  bookId: string,
  response: 'read' | 'queued' | 'skipped',
  skillIds: SkillId[],
  skillLevelAtRead: number | null
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  await prisma.bookSurveyResponse.upsert({
    where: { userId_bookId: { userId, bookId } },
    create: { userId, bookId, response, skillIds, skillLevelAtRead },
    update: { response, skillIds, skillLevelAtRead },
  });

  // 「読んだ」回答時はBookSkillTagを集計更新
  if (response === 'read' && skillIds.length > 0) {
    for (const skillId of skillIds) {
      const existing = await prisma.bookSkillTag.findUnique({
        where: { bookId_skillId: { bookId, skillId } },
      });

      if (existing) {
        const newCount = existing.count + 1;
        const newAvg = skillLevelAtRead
          ? (existing.avgSkillLevelAtRead * existing.count + skillLevelAtRead) / newCount
          : existing.avgSkillLevelAtRead;

        await prisma.bookSkillTag.update({
          where: { bookId_skillId: { bookId, skillId } },
          data: { count: newCount, avgSkillLevelAtRead: newAvg },
        });
      } else {
        await prisma.bookSkillTag.create({
          data: {
            bookId,
            skillId,
            count: 1,
            avgSkillLevelAtRead: skillLevelAtRead ?? 0,
          },
        });
      }
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/classics');
}

export async function addClassicToQueue(bookId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  // 積読追加
  const existing = await prisma.learningItem.findFirst({
    where: { userId, bookId, type: 'book' },
  });

  if (!existing) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { claudeSkillTags: true },
    });

    await prisma.learningItem.create({
      data: {
        userId,
        type: 'book',
        bookId,
        status: 'queued',
        skillIds: (book?.claudeSkillTags as SkillId[]) ?? [],
      },
    });
  }

  // 'queued' 回答として記録
  await prisma.bookSurveyResponse.upsert({
    where: { userId_bookId: { userId, bookId } },
    create: { userId, bookId, response: 'queued', skillIds: [], skillLevelAtRead: null },
    update: { response: 'queued' },
  });

  revalidatePath('/dashboard');
  revalidatePath('/classics');
  revalidatePath('/queue');
}
