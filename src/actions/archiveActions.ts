'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { SummaryService } from '@/services/SummaryService';

export async function updateSummary(id: string, summary: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  await prisma.learningArchive.updateMany({
    where: { id, userId: session.user.id, isConfirmed: false },
    data: { summary: summary.trim() },
  });

  revalidatePath('/archive');
}

export async function confirmArchive(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  await prisma.learningArchive.updateMany({
    where: { id, userId: session.user.id },
    data: { isConfirmed: true },
  });

  revalidatePath('/archive');
}

export async function generateCurrentMonthSummary(): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const service = new SummaryService();
  const result = await service.generateMonthlySummary(session.user.id, year, month);

  if (!result) {
    return { success: false, message: '今月の読了記録がありません。記事や書籍を読了してから再試行してください。' };
  }

  revalidatePath('/archive');
  return { success: true, message: 'サマリを生成しました。' };
}
