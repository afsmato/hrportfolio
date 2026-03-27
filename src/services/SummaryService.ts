import { claude } from '@/lib/claude';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK } from '@/constants/SKILL_FRAMEWORK';

const SKILL_LABEL_MAP: Record<string, string> = Object.values(SKILL_FRAMEWORK)
  .flat()
  .reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {});

export interface ArchiveEntry {
  id: string;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  summary: string;
  isConfirmed: boolean;
  createdAt: Date;
}

export class SummaryService {
  async generateMonthlySummary(
    userId: string,
    year: number,
    month: number
  ): Promise<ArchiveEntry | null> {
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59);
    const period = `${year}-${String(month).padStart(2, '0')}`;

    // 対象月の読了アイテムを取得
    const completedItems = await prisma.learningItem.findMany({
      where: {
        userId,
        status: 'completed',
        completedAt: { gte: periodStart, lte: periodEnd },
      },
      include: {
        article: { select: { title: true } },
        book: { select: { title: true } },
      },
    });

    if (completedItems.length === 0) return null;

    // 最新スキルスコアを取得
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

    // 学習記録を整形
    const articles = completedItems
      .filter((i) => i.type === 'article' && i.article)
      .map((i) => `・${i.article!.title}`);

    const books = completedItems
      .filter((i) => i.type === 'book' && i.book)
      .map((i) => `・${i.book!.title}`);

    const skillSection = Object.entries(latestScores)
      .map(([skillId, score]) => `・${SKILL_LABEL_MAP[skillId] ?? skillId}: ${score}/5`)
      .join('\n');

    const prompt = `あなたはHRプロフェッショナルのキャリアコーチです。
以下の学習記録とスキル評価から、「自分はXができる」という一人称の言語でスキル言語化サマリを生成してください。

【${year}年${month}月の学習記録】
${articles.length > 0 ? `読了記事（${articles.length}件）:\n${articles.slice(0, 10).join('\n')}` : '読了記事: なし'}

${books.length > 0 ? `読了書籍（${books.length}冊）:\n${books.slice(0, 5).join('\n')}` : '読了書籍: なし'}

【現在のスキル評価】
${skillSection || 'スキル評価未実施'}

上記に基づいて、以下のルールで日本語のサマリを生成してください:
- 「自分は〜できる」「私は〜の経験がある」という一人称で記述
- 具体的なスキル名や学習内容に言及
- 成長や進捗を前向きに表現
- 400字以内
- サマリ本文のみ出力（前置き・説明文は不要）`;

    const message = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const summary = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    if (!summary) return null;

    const archive = await prisma.learningArchive.upsert({
      where: { userId_period: { userId, period } },
      create: { userId, period, periodStart, periodEnd, summary, isConfirmed: false },
      update: { summary, isConfirmed: false },
    });

    return archive;
  }

  async getUserArchives(userId: string): Promise<ArchiveEntry[]> {
    return prisma.learningArchive.findMany({
      where: { userId },
      orderBy: { periodStart: 'desc' },
    });
  }
}
