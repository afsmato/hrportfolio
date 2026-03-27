import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import { DOMAIN_CONSTANTS } from '@/constants/DOMAIN_CONSTANTS';
import BookCard from '@/components/books/BookCard';
import BookSearchForm from '@/components/books/BookSearchForm';

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

export default async function BooksPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [books, queuedItems, gapSkillIds] = await Promise.all([
    prisma.book.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.learningItem.findMany({
      where: { userId, type: 'book', status: 'queued' },
      select: { bookId: true },
    }),
    getGapSkillIds(userId),
  ]);

  const queuedBookIds = new Set(queuedItems.map((i) => i.bookId).filter(Boolean) as string[]);

  const mappedBooks = books.map((b) => ({
    ...b,
    claudeSkillTags: b.claudeSkillTags as SkillId[],
    isGapRelated: (b.claudeSkillTags as string[]).some((sid) => gapSkillIds.has(sid as SkillId)),
    isQueued: queuedBookIds.has(b.id),
  }));

  // おすすめ（ギャップ関連）を先頭に
  const sorted = [
    ...mappedBooks.filter((b) => b.isGapRelated),
    ...mappedBooks.filter((b) => !b.isGapRelated),
  ];

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>書籍ランキング</h1>

      <BookSearchForm />

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af' }}>
          <p style={{ marginBottom: '0.5rem' }}>HR関連書籍がまだ登録されていません。</p>
          <p style={{ fontSize: '0.8rem' }}>毎週月曜日に自動取得されます。</p>
        </div>
      ) : (
        <>
          {gapSkillIds.size > 0 && sorted.some((b) => b.isGapRelated) && (
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
              ⭐ あなたのギャップスキルに関連する書籍を優先表示しています
            </p>
          )}
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
