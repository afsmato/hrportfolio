import { NextRequest, NextResponse } from 'next/server';
import { claude } from '@/lib/claude';
import { prisma } from '@/lib/prisma';
import { SKILL_FRAMEWORK, type SkillId } from '@/constants/SKILL_FRAMEWORK';

const ALL_SKILL_IDS: SkillId[] = Object.values(SKILL_FRAMEWORK).flatMap((skills) =>
  skills.map((s) => s.id as SkillId)
);

const HR_CLASSICS = [
  { title: 'ハイ・アウトプット・マネジメント', author: 'アンドリュー・S・グローブ' },
  { title: 'Drive　ドライブ！―モチベーション3.0', author: 'ダニエル・ピンク' },
  { title: 'WORK RULES!　君の生き方を変える、Googleで生まれた革命', author: 'ラズロ・ボック' },
  { title: '人材を活かす企業', author: 'ジェフリー・フェファー' },
  { title: '戦略的人的資源管理論の新展開', author: 'ポール・ボクソール, ジョン・パーセル' },
  { title: 'ピープル・アナリティクスの教科書', author: 'デービッド・グリーン, ジョナサン・ブラウン' },
  { title: '第5の規律　学習する組織', author: 'ピーター・センゲ' },
  { title: 'Fearless Organization　恐れのない組織', author: 'エイミー・エドモンドソン' },
  { title: 'ティール組織', author: 'フレデリック・ラルー' },
  { title: 'Radical Candor（ラディカル・キャンドア）', author: 'キム・スコット' },
  { title: '「学習する組織」入門', author: '小田理一郎' },
  { title: 'エビデンスに基づく人事管理', author: 'エリック・バリュー, デービッド・バニー' },
  { title: 'The HR Scorecard', author: 'ブライアン・ベッカー, マーク・ヒューゼリッド, デイビッド・ウルリッチ' },
  { title: 'タレントマネジメント入門', author: '中島豊' },
  { title: '組織開発の探求', author: '中村和彦' },
  { title: '人事評価の教科書', author: '長谷川和廣' },
  { title: 'Nudge　実践行動経済学', author: 'リチャード・セイラー, キャス・サンスティーン' },
  { title: 'ファスト＆スロー', author: 'ダニエル・カーネマン' },
  { title: '影響力の武器', author: 'ロバート・B・チャルディーニ' },
  { title: '予測できる不合理', author: 'ダン・アリエリー' },
  { title: 'GIVE & TAKE「与える人」こそ成功する時代', author: 'アダム・グラント' },
  { title: 'ORIGINALS　誰もが「人と違うこと」ができる時代', author: 'アダム・グラント' },
  { title: 'マインドセット　「やればできる！」の研究', author: 'キャロル・S・ドゥエック' },
  { title: 'PEAK　パフォーマンスの科学', author: 'アンダース・エリクソン, ロバート・プール' },
  { title: 'チームが機能するとはどういうことか', author: 'エイミー・エドモンドソン' },
  { title: '変革型リーダーシップ', author: 'ジョン・P・コッター' },
  { title: '経営変革の核心', author: 'ジョン・P・コッター' },
  { title: '5つの選択', author: 'アダム・メレル, クリス・マクチェスニー, ジム・ヒューリング' },
  { title: 'カルチャーコード　最強チームをつくる方法', author: 'ダニエル・コイル' },
  { title: '心理的安全性のつくりかた', author: '石井遼介' },
  { title: '成果主義のジレンマ', author: 'アルフィ・コーン' },
  { title: '幸福優位7つの法則', author: 'ショーン・エイカー' },
  { title: 'なぜ弱さを見せあえる組織が強いのか', author: 'ロバート・キーガン, リサ・ラスコウ・レイヒー' },
  { title: '沈黙は金ではない', author: 'フランシス・フレイ, アン・モリス' },
  { title: 'アジャイルHR', author: 'リリア・ペレス, ピーター・ジャーブナー' },
  { title: '人材マネジメントの新しいアプローチ', author: 'ジョン・W・ブードロー, ラム・チャラン' },
  { title: 'Strategic Human Resource Management', author: 'ジェフリー・A・マイルズ' },
  { title: 'People Analytics', author: 'ベン・ウォーカー' },
  { title: '組織診断', author: 'ダーバー・アレン, デボラ・マグラフ' },
  { title: 'サーベイフィードバック入門', author: '渡部幹' },
  { title: '対話型組織開発', author: 'ジャルヴァン・バスチャン, ロバート・プリスリー' },
  { title: 'コーチングの基本', author: 'コーチ・エィ' },
  { title: 'OKR（メジャー・ホワット・マターズ）', author: 'ジョン・ドーア' },
  { title: '最高の職場をつくる', author: 'マーカス・バッキンガム, コート・コフマン' },
  { title: 'リワーク　マネジメントの常識を覆す', author: 'ジェイソン・フリード, デイビッド・ハイネマイヤー・ハンソン' },
  { title: 'People Operations', author: 'ジェイ・シェッティ, アリー・グリーン' },
  { title: 'HRテクノロジーの未来', author: 'ジョシュ・バーシン' },
  { title: '人事と組織の経済学・実践編', author: 'エドワード・P・ラジアー, マイケル・ギブス' },
  { title: 'チェンジマネジメント3.0', author: 'ユルゲン・アペロ' },
  { title: 'はじめての人材研究', author: '大湾秀雄' },
];

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1回のClaude APIコールで全書籍を一括タグ付け
    const bookList = HR_CLASSICS.map((b, i) => `${i + 1}. ${b.title} / ${b.author}`).join('\n');

    const prompt = `以下のHR・人事・組織開発に関連する書籍リストに対して、各書籍に関連するスキルIDを付与してください。

書籍リスト:
${bookList}

利用可能なスキルID: ${ALL_SKILL_IDS.join(', ')}

以下のJSON形式のみで返してください（説明文不要）:
{
  "books": [
    { "index": 1, "skillIds": ["skill_id_1", "skill_id_2"] },
    ...
  ]
}

各書籍に最大3つのスキルIDを付与。必ずindex 1から${HR_CLASSICS.length}まで全書籍を含めること。`;

    const message = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse Claude response' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      books?: { index?: number; skillIds?: unknown[] }[];
    };

    const tagMap: Record<number, SkillId[]> = {};
    for (const entry of parsed.books ?? []) {
      if (entry.index) {
        tagMap[entry.index] = (entry.skillIds ?? [])
          .filter((s): s is SkillId => ALL_SKILL_IDS.includes(s as SkillId))
          .slice(0, 3);
      }
    }

    // DB upsert
    let seeded = 0;
    for (let i = 0; i < HR_CLASSICS.length; i++) {
      const book = HR_CLASSICS[i];
      const skillIds = tagMap[i + 1] ?? [];
      const isbn = `classic-${i + 1}`;

      await prisma.book.upsert({
        where: { isbn },
        create: {
          isbn,
          title: book.title,
          author: book.author,
          publisher: '',
          publishedDate: '',
          isClassic: true,
          claudeSkillTags: skillIds,
        },
        update: {
          title: book.title,
          author: book.author,
          isClassic: true,
          claudeSkillTags: skillIds,
        },
      });
      seeded++;
    }

    return NextResponse.json({ seeded });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[admin/seed-classics] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
