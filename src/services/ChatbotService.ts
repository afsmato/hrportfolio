import Anthropic from '@anthropic-ai/sdk';
import { HR_KNOWLEDGE_BASE, type KnowledgeChunk } from '@/constants/HR_KNOWLEDGE_BASE';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });


// e-Gov APIの主要法令ID
const LAW_ID_MAP: Record<string, string> = {
  '労働基準法': '329AC0000000049',
  '育児休業': '403AC0000000076',
  '介護休業': '403AC0000000076',
  '労働安全衛生': '347AC0000000057',
};

export interface ChatSource {
  title: string;
  url?: string;
}

export interface ChatHistory {
  role: 'user' | 'assistant';
  content: string;
}

export class ChatbotService {
  searchKnowledge(query: string): KnowledgeChunk[] {
    const scored = HR_KNOWLEDGE_BASE.map((chunk) => {
      const overlap = chunk.keywords.filter((kw) => query.includes(kw)).length;
      return { chunk, score: overlap };
    });
    return scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ chunk }) => chunk);
  }

  async fetchLawContext(query: string): Promise<{ text: string; source: string } | null> {
    const matchedKey = Object.keys(LAW_ID_MAP).find((kw) => query.includes(kw));
    if (!matchedKey) return null;

    const lawId = LAW_ID_MAP[matchedKey];
    try {
      const res = await fetch(`https://laws.e-gov.go.jp/api/1/lawdata/${lawId}`, {
        headers: { Accept: 'application/xml' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      const xml = await res.text();

      // 条文テキストを抽出（Sentence要素の内容）
      const sentences: string[] = [];
      const sentenceMatches = xml.matchAll(/<Sentence>([\s\S]*?)<\/Sentence>/g);
      for (const m of sentenceMatches) {
        const text = m[1].replace(/<[^>]+>/g, '').trim();
        if (text) sentences.push(text);
        if (sentences.length >= 10) break; // 最大10文
      }

      if (sentences.length === 0) return null;

      const lawNameMatch = xml.match(/<LawTitle>(.*?)<\/LawTitle>/);
      const lawName = lawNameMatch ? lawNameMatch[1] : matchedKey;

      return {
        text: sentences.join('\n'),
        source: lawName,
      };
    } catch {
      return null;
    }
  }

  async chat(
    content: string,
    history: ChatHistory[]
  ): Promise<{ answer: string; sources: ChatSource[] }> {
    const knowledgeChunks = this.searchKnowledge(content);
    const lawContext = await this.fetchLawContext(content);

    const sources: ChatSource[] = [];
    const contextParts: string[] = [];

    for (const chunk of knowledgeChunks) {
      contextParts.push(`### ${chunk.title}\n${chunk.content}\n出典: ${chunk.source}`);
      sources.push({ title: chunk.source });
    }

    if (lawContext) {
      contextParts.push(`### e-Gov法令API取得情報\n${lawContext.text}`);
      sources.push({
        title: lawContext.source,
        url: `https://laws.e-gov.go.jp/law/${Object.values(LAW_ID_MAP)[0]}`,
      });
    }

    const contextSection =
      contextParts.length > 0
        ? `\n\n[参照コンテキスト]\n${contextParts.join('\n\n')}`
        : '';

    const systemPrompt = `あなたはHR（人事）領域の専門アドバイザーです。日本の労働法規・HR実務に関する質問に、提供されたコンテキストを参照して正確に回答してください。

回答の最後には必ず「【参照】」セクションを設け、参照した法令・資料名を箇条書きで列挙してください。
コンテキストにない情報については、「詳細は〇〇をご確認ください」と案内するにとどめ、推測での断言は避けてください。${contextSection}`;

    // 会話履歴は最新10件に制限
    const recentHistory = history.slice(-10);
    const messages: Anthropic.MessageParam[] = [
      ...recentHistory.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const answer =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return { answer, sources };
  }
}
