import { claude } from '@/lib/claude';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';

const ALL_SKILL_IDS: SkillId[] = Object.values(SKILL_FRAMEWORK).flatMap((skills) =>
  skills.map((s) => s.id as SkillId)
);

const SKILL_LABEL_MAP: Record<string, string> = Object.values(SKILL_FRAMEWORK)
  .flat()
  .reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {});

export interface TrendKeywordData {
  id: string;
  rank: number;
  keyword: string;
  relatedSkillIds: SkillId[];
  articleCount: number;
}

export interface TrendReportData {
  id: string;
  generatedAt: Date;
  periodFrom: Date;
  periodTo: Date;
  keywords: TrendKeywordData[];
}

export class TrendService {
  async getLatestReport(): Promise<TrendReportData | null> {
    const report = await prisma.trendReport.findFirst({
      orderBy: { generatedAt: 'desc' },
      include: {
        keywords: {
          orderBy: { rank: 'asc' },
        },
      },
    });

    if (!report) return null;

    return {
      id: report.id,
      generatedAt: report.generatedAt,
      periodFrom: report.periodFrom,
      periodTo: report.periodTo,
      keywords: report.keywords.map((k) => ({
        id: k.id,
        rank: k.rank,
        keyword: k.keyword,
        relatedSkillIds: (k.relatedSkillIds as string[]).filter((s): s is SkillId =>
          ALL_SKILL_IDS.includes(s as SkillId)
        ),
        articleCount: k.articleCount,
      })),
    };
  }

  async generateMonthlyTrend(): Promise<{ keywords: number }> {
    const periodTo = new Date();
    const periodFrom = new Date();
    periodFrom.setMonth(periodFrom.getMonth() - 2);

    // 直近2ヶ月の記事を取得（最大200件）
    const articles = await prisma.article.findMany({
      where: {
        publishedAt: { gte: periodFrom },
      },
      select: { title: true, summary: true },
      orderBy: { publishedAt: 'desc' },
      take: 200,
    });

    if (articles.length === 0) {
      return { keywords: 0 };
    }

    const articleList = articles
      .map((a, i) => `${i + 1}. タイトル: ${a.title}\n   要約: ${a.summary.slice(0, 100)}`)
      .join('\n');

    const prompt = `以下はHR領域の記事タイトルと要約の一覧です（直近2ヶ月分）。
これらの記事から、最近のHR領域でのトレンドキーワードTop10を抽出してください。

記事一覧:
${articleList}

以下のJSON形式のみで返してください（説明文不要）:
{
  "keywords": [
    {
      "rank": 1,
      "keyword": "キーワード（日本語）",
      "relatedSkillIds": ["skill_id_1"],
      "articleCount": 5
    }
  ]
}

relatedSkillIdsは次のIDから最大3つ選択: ${ALL_SKILL_IDS.join(', ')}
keywordは日本語で、HRプロが関心を持つ具体的なトレンドワードにしてください。`;

    const message = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { keywords: 0 };

    const parsed = JSON.parse(jsonMatch[0]) as {
      keywords?: {
        rank?: number;
        keyword?: string;
        relatedSkillIds?: unknown[];
        articleCount?: number;
      }[];
    };

    const keywords = (parsed.keywords ?? []).slice(0, 10).map((k, i) => ({
      rank: k.rank ?? i + 1,
      keyword: k.keyword ?? '',
      relatedSkillIds: (k.relatedSkillIds ?? []).filter((s): s is SkillId =>
        ALL_SKILL_IDS.includes(s as SkillId)
      ),
      articleCount: k.articleCount ?? 0,
    }));

    await prisma.trendReport.create({
      data: {
        periodFrom,
        periodTo,
        keywords: {
          create: keywords.map((k) => ({
            rank: k.rank,
            keyword: k.keyword,
            relatedSkillIds: k.relatedSkillIds,
            articleCount: k.articleCount,
          })),
        },
      },
    });

    return { keywords: keywords.length };
  }

  getSkillLabel(skillId: string): string {
    return SKILL_LABEL_MAP[skillId] ?? skillId;
  }
}
