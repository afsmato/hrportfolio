import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeedService } from './FeedService';
import type { RssItem } from '@/lib/rss';

// Mock dependencies
vi.mock('@/lib/claude', () => ({
  claude: {
    messages: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    articleSource: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock('@/repositories/ArticleRepository', () => ({
  ArticleRepository: vi.fn().mockImplementation(() => ({
    upsertMany: vi.fn().mockResolvedValue(0),
  })),
}));

vi.mock('@/lib/rss', () => ({
  fetchRssFeed: vi.fn().mockResolvedValue([]),
}));

import { claude } from '@/lib/claude';

const mockClaude = claude as unknown as { messages: { create: ReturnType<typeof vi.fn> } };

const sampleItem: RssItem = {
  title: 'People Analytics: Using Data to Drive HR Decisions',
  link: 'https://example.com/article/1',
  contentSnippet: 'This article explores how organizations use data analytics to improve HR outcomes.',
  isoDate: '2026-03-25T09:00:00.000Z',
};

describe('FeedService', () => {
  let feedService: FeedService;

  beforeEach(() => {
    feedService = new FeedService();
    vi.clearAllMocks();
  });

  describe('analyzeArticle', () => {
    it('正常なClaudeレスポンスから分析結果を返す', async () => {
      mockClaude.messages.create.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: 'データ分析を活用したHR意思決定の手法を解説する記事。組織のHR成果向上に向けた具体的なアプローチを紹介。',
              tags: ['data_literacy', 'hr_metrics'],
              difficulty: 'practical',
            }),
          },
        ],
      });

      const result = await feedService.analyzeArticle(sampleItem, 'AIHR', 'people_analytics');

      expect(result.summary).toBe(
        'データ分析を活用したHR意思決定の手法を解説する記事。組織のHR成果向上に向けた具体的なアプローチを紹介。'
      );
      expect(result.tags).toEqual(['data_literacy', 'hr_metrics']);
      expect(result.difficulty).toBe('practical');
    });

    it('不正なdifficultyはpracticalにフォールバックする', async () => {
      mockClaude.messages.create.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: 'テスト要約',
              tags: ['data_literacy'],
              difficulty: 'unknown_value',
            }),
          },
        ],
      });

      const result = await feedService.analyzeArticle(sampleItem, 'Test Source', 'people_analytics');

      expect(result.difficulty).toBe('practical');
    });

    it('不正なskillIdはフィルタリングされる', async () => {
      mockClaude.messages.create.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: 'テスト要約',
              tags: ['data_literacy', 'invalid_skill_id', 'hr_metrics'],
              difficulty: 'beginner',
            }),
          },
        ],
      });

      const result = await feedService.analyzeArticle(sampleItem, 'Test Source', 'people_analytics');

      expect(result.tags).toEqual(['data_literacy', 'hr_metrics']);
    });

    it('tagsが3件を超える場合は最大3件に切り詰める', async () => {
      mockClaude.messages.create.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: 'テスト要約',
              tags: ['data_literacy', 'hr_metrics', 'data_visualization', 'survey_design'],
              difficulty: 'advanced',
            }),
          },
        ],
      });

      const result = await feedService.analyzeArticle(sampleItem, 'Test Source', 'people_analytics');

      expect(result.tags.length).toBeLessThanOrEqual(3);
    });

    it('ClaudeがJSONを返さない場合はエラーをthrowする', async () => {
      mockClaude.messages.create.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'すみません、分析できませんでした。',
          },
        ],
      });

      await expect(
        feedService.analyzeArticle(sampleItem, 'Test Source', 'people_analytics')
      ).rejects.toThrow();
    });

    it('contentSnippetがない場合も処理できる', async () => {
      const itemWithoutSnippet: RssItem = { ...sampleItem, contentSnippet: undefined };

      mockClaude.messages.create.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: '概要なしの記事の要約',
              tags: ['hr_metrics'],
              difficulty: 'expert',
            }),
          },
        ],
      });

      const result = await feedService.analyzeArticle(
        itemWithoutSnippet,
        'Test Source',
        'people_analytics'
      );

      expect(result.difficulty).toBe('expert');
    });

    it('全difficultylevel（beginner/practical/advanced/expert）を正しく処理する', async () => {
      const difficulties = ['beginner', 'practical', 'advanced', 'expert'] as const;

      for (const diff of difficulties) {
        mockClaude.messages.create.mockResolvedValue({
          content: [
            {
              type: 'text',
              text: JSON.stringify({ summary: '要約', tags: [], difficulty: diff }),
            },
          ],
        });

        const result = await feedService.analyzeArticle(
          sampleItem,
          'Test Source',
          'people_analytics'
        );
        expect(result.difficulty).toBe(diff);
      }
    });
  });
});
