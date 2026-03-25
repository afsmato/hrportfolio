# 開発ガイドライン (Development Guidelines)

## コーディング規約

### 命名規則

#### 変数・関数

```typescript
// ✅ 良い例
const skillAssessmentData = await fetchSkillMap(userId);
function calcArticleRecommendScore(article: Article, gapSkills: SkillId[]): number { }
const isSkillMapComplete = assessments.length === SKILL_FRAMEWORK_COUNT;

// ❌ 悪い例
const data = await fetch(id);
function calc(a: any, b: any[]): number { }
```

**原則**:
- 変数: camelCase、名詞または名詞句
- 関数: camelCase、動詞で始める
- Boolean: `is`, `has`, `should`, `can` で始める
- 定数: UPPER_SNAKE_CASE（例: `SKILL_FRAMEWORK`, `ARTICLE_SOURCES`）

#### クラス・インターフェース

```typescript
// サービスクラス
class SkillService { }
class PortfolioService { }

// リポジトリクラス
class SkillRepository { }
class ArticleRepository { }

// 型エイリアス（ユニオン型）
type SkillId = 'data_literacy' | 'causal_inference' | ...;
type ArticleCategory = 'people_analytics' | 'organizational_development' | ...;
```

### コードフォーマット

- **インデント**: 2スペース
- **行の長さ**: 最大100文字
- **セミコロン**: あり
- **クォート**: シングルクォート
- フォーマットは **Prettier** で自動適用（設定は `.prettierrc` を参照）
- Lintは **ESLint** で静的解析（設定は `eslint.config.ts` を参照）
  - 適用ルールセット: `eslint:recommended`、`@typescript-eslint/recommended`、`next/core-web-vitals`
  - `any` 型の使用禁止（外部ライブラリとの境界で必要な場合は `// eslint-disable-next-line` にコメントで理由を記載）
  - `console.log` の使用禁止（`console.error` / `console.warn` は許可）
  - `as` キャストはZodバリデーション通過後のデータのみ許可

### コメント規約

**サービス・リポジトリ関数のTSDoc**:
```typescript
/**
 * ユーザーのスキルギャップに基づいておすすめ記事を取得する
 *
 * @param userId - 対象ユーザーのID
 * @param limit - 取得件数（デフォルト: 5）
 * @returns スコア順に並んだ記事リスト
 * @throws {NotFoundError} ユーザーが存在しない場合
 */
async function getRecommendedArticles(userId: string, limit = 5): Promise<Article[]> {
  // 実装
}
```

**インラインコメント**:
```typescript
// ✅ 良い例: なぜそうするかを説明
// 楽天・Amazon両APIのレスポンスをISBNをキーに重複排除してマージ
const merged = mergeBooksByIsbn(rakutenBooks, amazonBooks);

// ❌ 悪い例: コードを読めば分かることを書く
// 重複を排除してマージする
const merged = mergeBooksByIsbn(rakutenBooks, amazonBooks);
```

### エラーハンドリング

**カスタムエラークラス**:
```typescript
class ValidationError extends Error {
  constructor(message: string, public field: string, public value: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(public resource: string, public id: string) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

class ExternalApiError extends Error {
  constructor(public service: 'rakuten' | 'amazon' | 'claude', public cause?: Error) {
    super(`外部API呼び出しに失敗しました: ${service}`);
    this.name = 'ExternalApiError';
  }
}
```

**エラーハンドリングパターン**:
```typescript
// ✅ 良い例
// Promise.allSettled は reject しないため try-catch は不要。両方失敗した場合のみエラーを throw する
async function searchBooks(query: string): Promise<Book[]> {
  const [rakutenResult, amazonResult] = await Promise.allSettled([
    rakutenClient.search(query),
    amazonClient.search(query),
  ]);

  // 両方失敗した場合のみエラーを throw
  if (rakutenResult.status === 'rejected' && amazonResult.status === 'rejected') {
    throw new ExternalApiError('rakuten', rakutenResult.reason);
  }

  // 片方が失敗しても、もう片方の結果を返す
  const books = [
    ...(rakutenResult.status === 'fulfilled' ? rakutenResult.value : []),
    ...(amazonResult.status === 'fulfilled' ? amazonResult.value : []),
  ];

  return mergeBooksByIsbn(books);
}
```

### 非同期処理

**独立した外部API呼び出しは並列実行**:
```typescript
// ✅ 良い例: 楽天・Amazon を並列で叩く
const [rakutenResult, amazonResult] = await Promise.allSettled([
  rakutenClient.search(query),
  amazonClient.search(query),
]);

// ❌ 悪い例: 直列実行（遅い）
const rakutenResult = await rakutenClient.search(query);
const amazonResult = await amazonClient.search(query);
```

---

## Git運用ルール

### ブランチ戦略（Git Flow）

```
main（本番環境）
└── develop（開発・統合）
    ├── feature/[機能名]     新機能開発
    ├── fix/[修正内容]       バグ修正
    └── release/[バージョン] リリース準備（必要に応じて）
```

**運用ルール**:
- `main` と `develop` への直接コミットは禁止（PR必須）
- `feature/*` / `fix/*` は `develop` から分岐し、作業完了後にPRで `develop` へマージ
- `develop` → `main` のマージはリリース時のみ

**ブランチ命名例**:
```
feature/skill-assessment-ui
feature/article-feed-cron
fix/book-isbn-dedup
```

### コミットメッセージ規約（Conventional Commits）

```
<type>(<scope>): <subject>

<body>（任意）

<footer>（任意）
```

**スコープの例（HRPortfolio固有）**:
- `skills` スキルマップ・評価
- `feed` 情報フィード・記事収集
- `learning` 学習ログ
- `books` 書籍機能
- `portfolio` 公開ポートフォリオ
- `auth` 認証
- `cron` バックグラウンドジョブ

**コミット例**:
```
feat(skills): スキル自己評価UIを実装

5段階スライダーでスキルを評価できるようにした。
評価後にレーダーチャートがリアルタイムで更新される。

- SkillService.assess() APIとの接続
- Rechartsによるレーダーチャート実装
- 3ヶ月未評価ユーザーへのリマインドバナー追加

Closes #42
```

### プルリクエストプロセス

**作成前チェック**:
- [ ] 全テストがパス（`npm test`）
- [ ] Lintエラーなし（`npm run lint`）
- [ ] 型チェックパス（`npm run typecheck`）
- [ ] 変更行数が300行以内（超える場合は分割を検討）

**PRテンプレート**:
```markdown
## 変更の種類
- [ ] 新機能 (feat)
- [ ] バグ修正 (fix)
- [ ] リファクタリング (refactor)
- [ ] ドキュメント (docs)
- [ ] その他 (chore)

## 変更内容
### 何を変更したか
[簡潔な説明]

### なぜ変更したか
[背景・理由]

### どのように変更したか
- [変更点1]
- [変更点2]

## テスト
- [ ] ユニットテスト追加
- [ ] 統合テスト追加
- [ ] 手動テスト実施（モバイル表示確認含む）

## 関連Issue
Closes #[番号]

## レビューポイント
[特に見てほしい点]
```

---

## テスト戦略

### テストピラミッド

```
      /\
     /E2E\       3シナリオ（主要フロー）
    /------\
   / 統合   \    スキル評価フロー / 学習ログフロー
  /----------\
 / ユニット   \  サービスレイヤー 80%以上カバレッジ
/--------------\
```

### テストフレームワーク

- **ユニット・統合テスト**: [Vitest](https://vitest.dev/) 2.x（Viteベース・TypeScriptネイティブ対応）
- **E2Eテスト**: [Playwright](https://playwright.dev/) 1.x（クロスブラウザ・モバイルエミュレーション）
- **実行コマンド**: `npm run test`（Vitest）/ `npm run test:e2e`（Playwright）

### カバレッジ目標

| 対象 | 目標 |
|---|---|
| `src/services/`（ビジネスロジック） | 80%以上 |
| `src/repositories/` | 60%以上 |
| `src/app/api/`（APIルート） | 統合テストでカバー |
| `src/components/` | E2Eテストでカバー |

### テストの書き方（Given-When-Then）

```typescript
describe('SkillService', () => {
  describe('getGapSkills', () => {
    it('スコアが2以下のスキルをギャップとして返す', async () => {
      // Given: スキル評価データを準備
      const mockAssessments = [
        { skillId: 'causal_inference', score: 2 },
        { skillId: 'data_literacy', score: 5 },
        { skillId: 'org_diagnosis', score: 1 },
      ];
      mockSkillRepository.findLatestByUserId.mockResolvedValue(mockAssessments);

      // When: ギャップスキルを取得
      const gapSkills = await skillService.getGapSkills('user-123');

      // Then: スコア2以下のスキルのみ返る
      expect(gapSkills).toEqual(['causal_inference', 'org_diagnosis']);
      expect(gapSkills).not.toContain('data_literacy');
    });
  });
});
```

### 外部API・DBのモック方針

- **ユニットテスト**: リポジトリ・外部クライアントはすべてモック化
- **統合テスト**: テスト用PostgreSQLコンテナを使用（本物のDBを使う）
- **外部API（楽天・Amazon・Claude）**: 統合テストでもモック化（課金・レート制限のため）

---

## コードレビュー基準

### レビューポイント

**機能性**:
- [ ] PRDの受け入れ条件を満たしているか
- [ ] エッジケースが考慮されているか（外部APIが落ちた場合、空データの場合等）
- [ ] エラーハンドリングが適切か

**セキュリティ**:
- [ ] APIルートでユーザー認証・認可チェックがされているか
- [ ] 他ユーザーのデータにアクセスできないか（`userId` フィルタの確認）
- [ ] 環境変数に機密情報が正しく移されているか

**パフォーマンス**:
- [ ] 不要なDB呼び出しがないか（N+1問題）
- [ ] 楽天・Amazon APIへの過剰な呼び出しがないか

**モバイル対応**:
- [ ] スマートフォン表示で崩れがないか（Tailwindのレスポンシブ確認）

### レビューコメントの書き方

```markdown
[必須] 他ユーザーのデータが取得できます。
       `userId` フィルタをWhereに追加してください。

[推奨] 楽天・Amazonの検索を `Promise.allSettled` で並列化すると
       レスポンスが速くなります。

[提案] この関数名 `calc` は何を計算するか分かりにくいです。
       `calcArticleRecommendScore` のように具体的にできますか？

[質問] このロジックの意図を教えてください。
```

---

## 開発環境セットアップ

### 必要なツール

| ツール | バージョン | インストール方法 |
|--------|-----------|-----------------|
| Node.js | v24.11.0 | [nvm](https://github.com/nvm-sh/nvm) 推奨 |
| npm | 11.x | Node.jsに同梱 |
| Docker | 最新 | [公式サイト](https://docs.docker.com/get-docker/) |

### セットアップ手順

#### devcontainerを使う場合（推奨）

```bash
# VS Code + Dev Containers拡張機能を使用
# 1. リポジトリをクローンしてVS Codeで開く
# 2. 「Reopen in Container」を選択（Node.js v24 + PostgreSQL環境が自動構築）
# 3. コンテナ起動後、以下を実行:
cp .env.example .env.local
# .env.local を編集（APIキー等を設定）
npx prisma migrate dev
npm run dev
# → http://localhost:3000 で起動
```

#### ローカル環境を使う場合

```bash
# 1. リポジトリのクローン
git clone https://github.com/[org]/hrportfolio.git
cd hrportfolio

# 2. 依存関係のインストール
npm install

# 3. 環境変数の設定
cp .env.example .env.local
# .env.local を編集（APIキー等を設定）

# 4. DBのセットアップ（Dockerでローカルのみ）
docker compose up -d postgres
npx prisma migrate dev

# 5. 開発サーバーの起動
npm run dev
# → http://localhost:3000 で起動
```

### 開発用コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # ESLintチェック
npm run typecheck    # TypeScript型チェック
npm run test         # ユニット・統合テスト実行
npm run test:e2e     # E2Eテスト実行（Playwright）
npm run test:cov     # カバレッジ付きテスト
npx prisma studio    # DB管理UI起動
npx prisma migrate dev  # マイグレーション実行
```

---

## 品質自動化（CI/CD）

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

### Pre-commit フック（Husky + lint-staged）

コミット時に自動でLint・型チェックを実行します。

```bash
# コミット前に自動実行される内容
lint-staged:  変更ファイルのESLint + Prettier
typecheck:    TypeScript型チェック
```
