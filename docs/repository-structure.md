# リポジトリ構造定義書 (Repository Structure Document)

## プロジェクト構造

```
hrportfolio/
├── src/                          # ソースコード（Next.js App Router）
│   ├── app/                      # ページ・APIルート
│   │   ├── (auth)/               # 認証が必要なページ群
│   │   │   ├── dashboard/        # ダッシュボード
│   │   │   ├── skills/           # スキルマップ
│   │   │   ├── feed/             # 情報フィード
│   │   │   ├── learning/         # 学習キュー
│   │   │   ├── books/            # 書籍ログ
│   │   │   ├── portfolio/        # ポートフォリオ編集
│   │   │   └── trend/            # トレンドレーダー
│   │   ├── api/                  # APIルート
│   │   │   ├── skills/           # スキル評価API
│   │   │   ├── feed/             # フィードAPI
│   │   │   ├── learning/         # 学習ログAPI
│   │   │   ├── books/            # 書籍API
│   │   │   ├── portfolio/        # ポートフォリオAPI
│   │   │   ├── trend/            # トレンドレーダーAPI
│   │   │   └── cron/             # Cronジョブエンドポイント
│   │   ├── layout.tsx            # ルートレイアウト
│   │   └── page.tsx              # トップ（ログインリダイレクト）
│   ├── components/               # UIコンポーネント
│   │   ├── ui/                   # 汎用UIコンポーネント（ボタン・カード等）
│   │   ├── skills/               # スキルマップ関連コンポーネント
│   │   ├── feed/                 # フィード関連コンポーネント
│   │   ├── learning/             # 学習ログ関連コンポーネント
│   │   ├── books/                # 書籍関連コンポーネント
│   │   ├── portfolio/            # ポートフォリオ関連コンポーネント
│   │   └── trend/                # トレンドレーダー関連コンポーネント
│   ├── services/                 # サービスレイヤー（ビジネスロジック）
│   │   ├── FeedService.ts        # 記事収集・おすすめロジック
│   │   ├── SkillService.ts       # スキル評価・ギャップ算出
│   │   ├── LearningService.ts    # 学習ログ管理
│   │   ├── BookService.ts        # 書籍検索・ランキング
│   │   ├── PortfolioService.ts   # 個人振り返りダッシュボードデータ生成
│   │   ├── TrendService.ts       # 月次トレンドキーワード生成・取得
│   │   └── NotificationService.ts # 棚卸しリマインダー・バナー管理
│   ├── repositories/             # データレイヤー（Prisma経由DB操作）
│   │   ├── ArticleRepository.ts
│   │   ├── SkillRepository.ts
│   │   ├── LearningRepository.ts
│   │   ├── BookRepository.ts
│   │   ├── PortfolioRepository.ts
│   │   ├── TrendRepository.ts        # TrendReport・TrendKeyword管理
│   │   ├── NotificationRepository.ts # NotificationLog管理
│   │   └── UserRepository.ts
│   ├── lib/                      # 外部サービス接続・初期化
│   │   ├── prisma.ts             # Prismaクライアントシングルトン
│   │   ├── claude.ts             # Claude APIクライアント
│   │   ├── rakuten.ts            # 楽天ブックスAPIクライアント
│   │   ├── amazon.ts             # Amazon PA APIクライアント
│   │   ├── resend.ts             # Resendメールクライアント
│   │   ├── kv.ts                 # Upstash Redisクライアント（楽天・Amazon APIキャッシュ用）
│   │   └── rss.ts                # RSSパーサー設定
│   ├── constants/                # 定数定義
│   │   ├── SKILL_FRAMEWORK.ts    # スキルフレームワーク定義（18スキル）
│   │   ├── ARTICLE_SOURCES.ts   # RSSソース一覧
│   │   └── DOMAIN_CONSTANTS.ts  # ドメイン定数（GAP_THRESHOLD, REVIEW_INTERVAL_DAYS 等）
│   ├── types/                    # 型定義
│   │   ├── skill.ts              # スキル関連型
│   │   ├── article.ts            # 記事関連型
│   │   ├── learning.ts           # 学習ログ関連型
│   │   └── portfolio.ts          # ポートフォリオ関連型
│   └── validators/               # Zodスキーマ（APIバリデーション）
│       ├── skillValidator.ts
│       ├── learningValidator.ts
│       └── bookValidator.ts
├── prisma/                       # DB管理
│   ├── schema.prisma             # DBスキーマ定義
│   └── migrations/               # マイグレーション履歴
├── tests/                        # テストコード
│   ├── unit/                     # ユニットテスト
│   │   └── services/
│   │       ├── FeedService.test.ts
│   │       ├── SkillService.test.ts
│   │       └── PortfolioService.test.ts
│   ├── integration/              # 統合テスト
│   │   ├── skill-assessment.test.ts
│   │   └── learning-flow.test.ts
│   └── e2e/                      # E2Eテスト（Playwright）
│       ├── onboarding.test.ts    # 初回スキルマップ完成フロー
│       ├── learning-flow.test.ts # 記事積読→読了フロー
│       └── portfolio.test.ts     # ポートフォリオ公開フロー
├── docs/                         # プロジェクトドキュメント
│   ├── product-requirements.md
│   ├── functional-design.md
│   ├── architecture.md
│   ├── repository-structure.md   # 本ドキュメント
│   ├── development-guidelines.md
│   ├── glossary.md
│   └── ideas/
│       └── initial-requirements.md
├── public/                       # 静的ファイル
│   └── images/
├── .claude/                      # Claude Code設定
│   ├── commands/                 # スラッシュコマンド
│   └── skills/                   # スキル定義
├── .steering/                    # 作業単位のドキュメント
├── .env.example                  # 環境変数のサンプル
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## ディレクトリ詳細

### src/app/（ページ・APIルート）

**役割**: Next.js App Routerによるページ定義とAPIエンドポイント

**配置ファイル**:
- `page.tsx` / `layout.tsx`: ページ・レイアウト定義
- `route.ts`: APIエンドポイント（`api/`配下のみ）

**命名規則**:
- ページディレクトリ: kebab-case（例: `skill-map/`）
- ファイル名: Next.jsの規約に従う（`page.tsx`, `layout.tsx`, `route.ts`）

**依存関係**:
- 依存可能: `components/`, `services/`（API Routesのみ）, `lib/`, `types/`
- 依存禁止: `repositories/`への直接アクセス（サービス経由のみ）

---

### src/components/（UIコンポーネント）

**役割**: 画面を構成するReactコンポーネント

**配置ファイル**:
- `ui/`: ボタン・カード・モーダル等、機能に依存しない汎用コンポーネント
- `skills/` `feed/` 等: 特定機能に紐づくコンポーネント

**命名規則**:
- ファイル名: PascalCase（例: `SkillRadarChart.tsx`, `ArticleCard.tsx`）
- コンポーネント名: ファイル名と一致させる

**依存関係**:
- 依存可能: `ui/`（機能コンポーネントから汎用UIを使う）, `types/`
- 依存禁止: `services/`, `repositories/`（データ取得はページ層で行う）

---

### src/services/（サービスレイヤー）

**役割**: ビジネスロジックの実装。外部API呼び出しの調整も担当

**配置ファイル**:
- `FeedService.ts`: 記事収集・おすすめスコアリング
- `SkillService.ts`: スキル評価・ギャップ算出・棚卸しリマインダー判定
- `LearningService.ts`: 学習ログ管理・サマリー集計
- `BookService.ts`: 楽天 + Amazon書籍検索・マージ・ランキング取得・書籍アンケート管理
- `PortfolioService.ts`: 個人振り返りダッシュボードデータ生成（スキルマップ・学習ログ・読書記録の集約）
- `TrendService.ts`: 月次トレンドキーワード生成・Claude API呼び出し管理
- `NotificationService.ts`: 棚卸しリマインダー判定・バナー表示状態管理・アンケート回答状態管理

**命名規則**:
- ファイル名: `[機能名]Service.ts`（PascalCase）

**依存関係**:
- 依存可能: `repositories/`, `lib/`, `constants/`, `types/`
- 依存禁止: `components/`, `app/`

---

### src/repositories/（データレイヤー）

**役割**: Prismaを経由したDB操作のみ。ビジネスロジックを含まない

**配置ファイル**:
- 各エンティティに対応する1ファイル

**命名規則**:
- ファイル名: `[エンティティ名]Repository.ts`（PascalCase）

**依存関係**:
- 依存可能: `lib/prisma.ts`, `types/`
- 依存禁止: `services/`, `components/`, `app/`

---

### src/constants/（定数定義）

**役割**: アプリ全体で参照する定数。特にスキルフレームワークのマスタデータ

**重要ファイル**:

```typescript
// SKILL_FRAMEWORK.ts - スキル領域・スキル定義のマスタ
// 将来の領域追加はこのファイルの変更のみで対応
export const SKILL_FRAMEWORK = {
  people_analytics: [...],
  organizational_development: [...],
  strategic_hr: [...],
} as const;

// ARTICLE_SOURCES.ts - RSSフィードのURL一覧
export const ARTICLE_SOURCES = [
  { id: 'josh_bersin', name: 'Josh Bersin', url: '...', category: 'people_analytics' },
  ...
] as const;
```

**命名規則**:
- ファイル名: UPPER_SNAKE_CASE（例: `SKILL_FRAMEWORK.ts`）

---

### prisma/（DB管理）

**役割**: データベーススキーマ定義とマイグレーション管理

```
prisma/
├── schema.prisma       # テーブル定義（唯一の信頼できるDB仕様書）
└── migrations/         # マイグレーション履歴（自動生成・手動変更禁止）
```

---

## ファイル配置規則

### ソースファイル

| ファイル種別 | 配置先 | 命名規則 | 例 |
|------------|--------|---------|-----|
| ページコンポーネント | `src/app/(auth)/[機能]/page.tsx` | Next.js規約 | `dashboard/page.tsx` |
| APIエンドポイント | `src/app/api/[機能]/route.ts` | Next.js規約 | `skills/route.ts` |
| UIコンポーネント | `src/components/[機能]/` | PascalCase.tsx | `SkillRadarChart.tsx` |
| サービスクラス | `src/services/` | `[名前]Service.ts` | `SkillService.ts` |
| リポジトリクラス | `src/repositories/` | `[名前]Repository.ts` | `SkillRepository.ts` |
| 型定義 | `src/types/` | camelCase.ts | `skill.ts` |
| Zodバリデーター | `src/validators/` | `[名前]Validator.ts` | `skillValidator.ts` |
| 定数 | `src/constants/` | UPPER_SNAKE_CASE.ts | `SKILL_FRAMEWORK.ts` |
| 外部クライアント | `src/lib/` | camelCase.ts | `prisma.ts` |

### テストファイル

| テスト種別 | 配置先 | 命名規則 | 例 |
|-----------|--------|---------|-----|
| ユニットテスト | `tests/unit/services/` | `[対象].test.ts` | `SkillService.test.ts` |
| 統合テスト | `tests/integration/` | `[機能フロー].test.ts` | `skill-assessment.test.ts` |
| E2Eテスト | `tests/e2e/` | `[ユーザーシナリオ].test.ts` | `onboarding.test.ts` |

---

## 命名規則

### ディレクトリ名
- `src/`直下のレイヤーディレクトリ: 複数形・kebab-case（`services/`, `repositories/`）
- `components/`配下の機能ディレクトリ: 単数形・kebab-case（`skills/`, `feed/`）
- `app/`配下のページディレクトリ: kebab-case（`skill-map/`）

### ファイル名
- Reactコンポーネント: PascalCase（`SkillRadarChart.tsx`）
- サービス・リポジトリ: PascalCase + 接尾辞（`SkillService.ts`）
- 型定義・ユーティリティ: camelCase（`skill.ts`, `formatDate.ts`）
- 定数: UPPER_SNAKE_CASE（`SKILL_FRAMEWORK.ts`）
- 設定ファイル: ツール規約に従う（`next.config.ts`）

---

## 依存関係のルール

```
app/（ページ・APIルート）
    ↓
components/（UIのみ）    services/（APIルートのみ）
                              ↓
                        repositories/
                              ↓
                        lib/（DB・外部APIクライアント）
```

**共通参照可能**（全レイヤーからアクセスOK）:
- `types/`: 型定義
- `constants/`: 定数
- `validators/`: バリデーションスキーマ

**禁止される依存**:
- `components/` → `services/` / `repositories/`（データ取得はページ層で行う）
- `repositories/` → `services/`（上位レイヤーへの依存禁止）
- サービス間の循環依存（共通ロジックは`lib/`に切り出す）

---

## スケーリング戦略

### HR専門領域の追加（P2対応）

将来、報酬・労務・採用等の領域を追加する際の拡張手順:

```
1. src/constants/SKILL_FRAMEWORK.ts に新領域を追加
   → DBマイグレーション不要

2. src/constants/ARTICLE_SOURCES.ts に領域特化ソースを追加

3. src/components/skills/ に領域選択UIを追加

4. テストを追加
```

### ファイルサイズの管理

- 1ファイル300行以下を推奨
- サービスクラスが肥大化した場合: 機能ごとにサブクラスに分割
  - 例: `BookService.ts` → `BookSearchService.ts` + `BookRankingService.ts`

---

## 除外設定

### .gitignore

```
node_modules/
.next/
dist/
.env
.env.local
.env.*.local
*.log
.DS_Store
coverage/
```

### .env.example（コミット対象・実値は含めない）

```
# Database (Neon - https://neon.tech)
DATABASE_URL="postgresql://...?pgbouncer=true"
DATABASE_URL_UNPOOLED="postgresql://..."

# Auth (NextAuth.js v5)
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."

# External APIs
ANTHROPIC_API_KEY="..."
RAKUTEN_APPLICATION_ID="..."
AMAZON_ACCESS_KEY="..."
AMAZON_SECRET_KEY="..."
AMAZON_PARTNER_TAG="..."
RESEND_API_KEY="..."
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```
