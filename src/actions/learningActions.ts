'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { SkillId } from '@/constants/SKILL_FRAMEWORK';
import type { RakutenBookItem } from '@/lib/rakuten';

export async function addToQueue(articleId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  const existing = await prisma.learningItem.findFirst({
    where: { userId, articleId, type: 'article' },
  });
  if (existing) return;

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { tags: true },
  });

  await prisma.learningItem.create({
    data: {
      userId,
      type: 'article',
      articleId,
      status: 'queued',
      skillIds: article?.tags ?? [],
    },
  });
}

export async function completeItem(
  id: string,
  memo: string,
  skillIds: SkillId[]
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  await prisma.learningItem.updateMany({
    where: { id, userId: session.user.id },
    data: {
      status: 'completed',
      completedAt: new Date(),
      memo: memo.trim() || null,
      skillIds,
    },
  });

  revalidatePath('/queue');
  revalidatePath('/dashboard');
}

export async function addBookToQueue(book: RakutenBookItem): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;
  const isbn = book.isbn || `rakuten-${book.itemCode}`;
  const publishedDate = book.salesDate
    ? book.salesDate.replace(/年(\d+)月.*/, '-$1').replace('年', '-')
    : '';

  const savedBook = await prisma.book.upsert({
    where: { isbn },
    create: {
      isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisherName,
      publishedDate,
      imageUrl: book.largeImageUrl,
      rakutenItemCode: book.itemCode,
      claudeSkillTags: [],
    },
    update: {},
  });

  const existing = await prisma.learningItem.findFirst({
    where: { userId, bookId: savedBook.id, type: 'book' },
  });
  if (existing) return;

  await prisma.learningItem.create({
    data: {
      userId,
      type: 'book',
      bookId: savedBook.id,
      status: 'queued',
      skillIds: savedBook.claudeSkillTags as SkillId[],
    },
  });

  revalidatePath('/books');
  revalidatePath('/queue');
}
