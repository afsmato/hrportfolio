import { Suspense } from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import { CAREER_PATHS } from '@/constants/CAREER_PATHS';
import { DOMAIN_CONSTANTS } from '@/constants/DOMAIN_CONSTANTS';
import BookCard from '@/components/books/BookCard';
import BookSearchForm from '@/components/books/BookSearchForm';
import CareerFilter from '@/components/books/CareerFilter';

async function getGapSkillIds(userId: string): Promise<Set<SkillId>> {
  const allSkillIds = Object.values(SKILL_FRAMEWORK).flatMap((s) => s.map((x) => x.id));
  const assessments = await prisma.skillAssessment.findMany({
    where: { userId, skillId: { in: allSkillIds } },
    orderBy: { assessedAt: 'desc' },
  });

  const latest: Record<string, number> = {};
  for (const a of assessments) {
    if (!latest[a.skillId]) latest[a.skillId] = a.score;
  }

  return new Set(
    Object.entries(latest)
      .filter(([, score]) => score <= DOMAIN_CONSTANTS.GAP_THRESHOLD)
      .map(([skillId]) => skillId as SkillId)
  );
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ career?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id!;
  const { career: careerId } = await searchParams;

  const selectedCareer = CAREER_PATHS.find((c) => c.id === careerId) ?? null;
  const careerSkillIds = selectedCareer ? Object.keys(selectedCareer.requiredSkills) : null;

  const [books, queuedItems, gapSkillIds] = await Promise.all([
    prisma.book.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.learningItem.findMany({
      where: { userId, type: 'book', status: 'queued' },
      select: { bookId: true },
    }),
    getGapSkillIds(userId),
  ]);

  const queuedBookIds = new Set(queuedItems.map((i) => i.bookId).filter(Boolean) as string[]);

  const mappedBooks = books.map((b) => {
    const tags = b.claudeSkillTags as string[];
    const overlapCount = careerSkillIds
      ? tags.filter((sid) => careerSkillIds.includes(sid)).length
      : 0;
    return {
      ...b,
      claudeSkillTags: tags as SkillId[],
      isGapRelated: tags.some((sid) => gapSkillIds.has(sid as SkillId)),
      isQueued: queuedBookIds.has(b.id),
      overlapCount,
    };
  });

  // キャリア選択時: 関連スキルが1つ以上ある書籍を関連度順で最大15件
  // 未選択時: ギャップ関連を先頭に全件表示
  const sorted = selectedCareer
    ? mappedBooks
        .filter((b) => b.overlapCount > 0)
        .sort((a, b) => b.overlapCount - a.overlapCount)
        .slice(0, 15)
    : [
        ...mappedBooks.filter((b) => b.isGapRelated),
        ...mappedBooks.filter((b) => !b.isGapRelated),
      ];

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>書籍ランキング</h1>

      <Suspense>
        <CareerFilter />
      </Suspense>

      <BookSearchForm />

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af' }}>
          {selectedCareer ? (
            <>
              <p style={{ marginBottom: '0.5rem' }}>「{selectedCareer.label}」に関連する書籍がまだ登録されていません。</p>
              <p style={{ fontSize: '0.8rem' }}>毎週月曜日に自動取得されます。</p>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '0.5rem' }}>HR関連書籍がまだ登録されていません。</p>
              <p style={{ fontSize: '0.8rem' }}>毎週月曜日に自動取得されます。</p>
            </>
          )}
        </div>
      ) : (
        <>
          {selectedCareer ? (
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
              「{selectedCareer.label}」に関連する書籍 {sorted.length}件
            </p>
          ) : gapSkillIds.size > 0 && sorted.some((b) => b.isGapRelated) ? (
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
              ⭐ あなたのギャップスキルに関連する書籍を優先表示しています
            </p>
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sorted.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isGapRelated={book.isGapRelated}
                isQueued={book.isQueued}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
