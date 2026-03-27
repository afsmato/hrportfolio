import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';
import { DOMAIN_CONSTANTS } from '@/constants/DOMAIN_CONSTANTS';

const ALL_SKILL_IDS: SkillId[] = Object.values(SKILL_FRAMEWORK).flatMap((skills) =>
  skills.map((s) => s.id as SkillId)
);

const SURVEY_THRESHOLD = 10; // BookSurveyResponseがこの件数以上でBoskSkillTagを使用

export interface ClassicBook {
  id: string;
  title: string;
  author: string;
  imageUrl: string | null;
  effectiveSkillIds: SkillId[];
  surveyCount: number;
  alreadyResponded: boolean;
}

type BookWithCounts = {
  id: string;
  title: string;
  author: string;
  imageUrl: string | null;
  claudeSkillTags: unknown;
  bookSkillTags: { skillId: string; count: number }[];
  bookSurveyResponses: { id: string }[];
  _count: { bookSurveyResponses: number };
};

function getEffectiveSkillIds(book: BookWithCounts): SkillId[] {
  const surveyCount = book._count.bookSurveyResponses;
  if (surveyCount >= SURVEY_THRESHOLD && book.bookSkillTags.length > 0) {
    return book.bookSkillTags
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((t) => t.skillId)
      .filter((s): s is SkillId => ALL_SKILL_IDS.includes(s as SkillId));
  }
  return (book.claudeSkillTags as string[]).filter((s): s is SkillId =>
    ALL_SKILL_IDS.includes(s as SkillId)
  );
}

function toClassicBook(book: BookWithCounts, _userId: string): ClassicBook {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    imageUrl: book.imageUrl,
    effectiveSkillIds: getEffectiveSkillIds(book),
    surveyCount: book._count.bookSurveyResponses,
    alreadyResponded: book.bookSurveyResponses.length > 0,
  };
}

const bookInclude = (userId: string) => ({
  bookSkillTags: {
    select: { skillId: true, count: true },
  },
  bookSurveyResponses: {
    where: { userId },
    select: { id: true },
  },
  _count: {
    select: { bookSurveyResponses: true },
  },
});

export class BookSurveyService {
  async getDailyBook(userId: string): Promise<ClassicBook | null> {
    const classics = await prisma.book.findMany({
      where: {
        isClassic: true,
        bookSurveyResponses: { none: { userId } },
      },
      include: bookInclude(userId),
      orderBy: { id: 'asc' },
    });

    if (classics.length === 0) return null;

    // 日付ベースで1冊選択（毎日変わる）
    const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const book = classics[dayOfYear % classics.length];
    return toClassicBook(book, userId);
  }

  async getRecommendedClassics(userId: string): Promise<ClassicBook[]> {
    // ユーザーのギャップスキルIDを取得
    const assessments = await prisma.skillAssessment.findMany({
      where: { userId },
      orderBy: { assessedAt: 'desc' },
    });

    const latestScores: Record<string, number> = {};
    for (const a of assessments) {
      if (!(a.skillId in latestScores)) {
        latestScores[a.skillId] = a.score;
      }
    }

    const gapSkillIds = Object.entries(latestScores)
      .filter(([, score]) => score <= DOMAIN_CONSTANTS.GAP_THRESHOLD)
      .map(([skillId]) => skillId);

    if (gapSkillIds.length === 0) return [];

    const classics = await prisma.book.findMany({
      where: { isClassic: true },
      include: bookInclude(userId),
    });

    return classics
      .map((book) => {
        const cb = toClassicBook(book, userId);
        const overlap = cb.effectiveSkillIds.filter((s) => gapSkillIds.includes(s)).length;
        return { ...cb, overlap };
      })
      .filter((b) => b.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 6);
  }

  async getAllClassics(userId: string): Promise<ClassicBook[]> {
    const classics = await prisma.book.findMany({
      where: { isClassic: true },
      include: bookInclude(userId),
      orderBy: { title: 'asc' },
    });

    return classics.map((book) => toClassicBook(book, userId));
  }
}
