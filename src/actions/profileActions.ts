'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function updateDomain(domain: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  await prisma.user.update({
    where: { id: session.user.id },
    data: { domain },
  });

  revalidatePath('/settings');
  revalidatePath('/dashboard');
}

export async function updateCareerGoal(careerGoal: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  await prisma.user.update({
    where: { id: session.user.id },
    data: { careerGoal },
  });

  revalidatePath('/roadmap');
}
