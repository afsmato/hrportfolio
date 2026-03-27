import { Suspense } from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import QueueTabs from '@/components/queue/QueueTabs';
import LearningItemCard from '@/components/queue/LearningItemCard';
import type { SkillId } from '@/constants/SKILL_FRAMEWORK';

type Tab = 'queued' | 'completed';

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ tab: tabParam }, session] = await Promise.all([searchParams, auth()]);
  const userId = session!.user!.id!;
  const tab: Tab = tabParam === 'completed' ? 'completed' : 'queued';

  const [items, queuedCount, completedCount] = await Promise.all([
    prisma.learningItem.findMany({
      where: { userId, status: tab },
      include: { article: { select: { id: true, title: true, url: true, category: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.learningItem.count({ where: { userId, status: 'queued' } }),
    prisma.learningItem.count({ where: { userId, status: 'completed' } }),
  ]);

  const mappedItems = items.map((item) => ({
    ...item,
    skillIds: item.skillIds as SkillId[],
  }));

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>学習キュー</h1>

      <Suspense>
        <QueueTabs currentTab={tab} queuedCount={queuedCount} completedCount={completedCount} />
      </Suspense>

      {mappedItems.length === 0 ? (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem 0' }}>
          {tab === 'queued' ? '「あとで読む」に追加した記事がありません。' : '読了済みの記事がありません。'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mappedItems.map((item) => (
            <LearningItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
