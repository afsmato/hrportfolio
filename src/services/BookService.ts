import { claude } from '@/lib/claude';
import { searchRakutenBooks, type RakutenBookItem } from '@/lib/rakuten';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';

const ALL_SKILL_IDS: SkillId[] = Object.values(SKILL_FRAMEWORK).flatMap((skills) =>
  skills.map((s) => s.id as SkillId)
);

export interface BookAnalysis {
  isHR: boolean;
  skillIds: SkillId[];
}

export class BookService {
  async analyzeBook(title: string, author: string): Promise<BookAnalysis> {
    const prompt = `以下のビジネス書がHR（人事・組織開発・People Analytics・労務・採用・L&D等）に関連するか判定してください。

書籍タイトル: ${title}
著者: ${author}

以下をJSON形式で返してください:
{
  "isHR": true または false,
  "skillIds": ["skill_id_1", "skill_id_2"]
}

skillIdsは次のスキルIDから最大3つ選択（HR関連の場合のみ）: ${ALL_SKILL_IDS.join(', ')}
isHRがfalseの場合はskillIdsは空配列にしてください。
JSONのみを返し、説明文は不要。`;

    const message = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { isHR: false, skillIds: [] };

    const parsed = JSON.parse(jsonMatch[0]) as { isHR?: boolean; skillIds?: unknown[] };
    const skillIds = (parsed.skillIds ?? [])
      .filter((s): s is SkillId => ALL_SKILL_IDS.includes(s as SkillId))
      .slice(0, 3);

    return { isHR: parsed.isHR === true, skillIds };
  }

  async fetchAndStoreRanking(): Promise<{ stored: number; errors: number }> {
    let stored = 0;
    let errors = 0;

    const items = await searchRakutenBooks({
      keyword: 'ビジネス',
      booksGenreId: '001004', // ビジネス書
      sort: 'reviewCount',
      hits: 30,
    });

    const results = await Promise.allSettled(
      items.map(async (item) => {
        try {
          const analysis = await this.analyzeBook(item.title, item.author);
          if (!analysis.isHR) return null;

          await this.upsertBook(item, analysis.skillIds);
          return item.isbn;
        } catch {
          errors++;
          return null;
        }
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) stored++;
      else if (result.status === 'rejected') errors++;
    }

    return { stored, errors };
  }

  private async upsertBook(item: RakutenBookItem, skillIds: SkillId[]): Promise<void> {
    const isbn = item.isbn || `rakuten-${item.itemCode}`;
    const publishedDate = item.salesDate
      ? item.salesDate.replace(/年(\d+)月.*/, '-$1').replace('年', '-')
      : '';

    await prisma.book.upsert({
      where: { isbn },
      create: {
        isbn,
        title: item.title,
        author: item.author,
        publisher: item.publisherName,
        publishedDate,
        imageUrl: item.largeImageUrl,
        rakutenItemCode: item.itemCode,
        claudeSkillTags: skillIds,
      },
      update: {
        title: item.title,
        author: item.author,
        publisher: item.publisherName,
        imageUrl: item.largeImageUrl,
      },
    });
  }
}
