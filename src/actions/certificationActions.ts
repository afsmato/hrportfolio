'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function upsertUserCertification(
  certificationId: string,
  status: 'completed' | 'in_progress' | 'planned',
  completedAt: Date | null
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  await prisma.userCertification.upsert({
    where: { userId_certificationId: { userId, certificationId } },
    create: { userId, certificationId, status, completedAt },
    update: { status, completedAt },
  });

  revalidatePath('/certifications');
  revalidatePath('/portfolio');
}
