# Books Fan

本好きのためのレビュー&推薦プラットフォーム

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes, tRPC
- **データベース**: PostgreSQL (Neon)
- **ORM**: Prisma
- **認証**: NextAuth.js (Google OAuth)
- **決済**: Stripe
- **AI**: OpenAI GPT-4o-mini
- **ホスティング**: Vercel

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を `.env` にコピーして、必要な環境変数を設定してください。

```bash
cp .env.example .env
```

#### 必要な環境変数

**Neon Database (無料)**
1. [Neon](https://neon.tech) でアカウント作成
2. 新しいプロジェクトを作成
3. 接続文字列をコピーして `DATABASE_URL` に設定

**NextAuth.js**
```bash
# シークレットキーを生成
openssl rand -base64 32
```

**Google OAuth (無料)**
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成
3. 「APIとサービス」→「認証情報」
4. 「OAuth 2.0 クライアント ID」を作成
5. 承認済みのリダイレクト URI: `http://localhost:3000/api/auth/callback/google`
6. クライアント ID とシークレットを `.env` に設定

**OpenAI API**
1. [OpenAI Platform](https://platform.openai.com/) でアカウント作成
2. API キーを作成
3. `.env` に設定

**Stripe (テストモード無料)**
1. [Stripe](https://stripe.com/) でアカウント作成
2. ダッシュボードから「開発者」→「APIキー」
3. テストモードのキーを `.env` に設定
4. Webhookを設定（後述）

**Google Books API (無料)**
1. [Google Cloud Console](https://console.cloud.google.com/) で Books API を有効化
2. API キーを作成
3. `.env` に設定

### 3. データベースのセットアップ

```bash
# Prisma Clientを生成
npx prisma generate

# データベースにスキーマを適用
npx prisma db push

# Prisma Studioでデータベースを確認（オプション）
npx prisma studio
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## プロジェクト構造

```
books-fan/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── (auth)/            # 認証関連ページ
│   ├── books/             # 本関連ページ
│   ├── dashboard/         # ダッシュボード
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # トップページ
├── components/            # Reactコンポーネント
│   ├── ui/               # 再利用可能なUIコンポーネント
│   ├── book/             # 本関連コンポーネント
│   └── layout/           # レイアウトコンポーネント
├── lib/                  # ユーティリティ
│   ├── prisma.ts         # Prisma Client
│   └── trpc.ts           # tRPC Client
├── server/               # サーバーサイドロジック
│   └── trpc/
│       ├── index.ts      # tRPC セットアップ
│       └── routers/      # tRPC ルーター
├── prisma/
│   └── schema.prisma     # データベーススキーマ
├── docs/                 # ドキュメント
│   ├── requirements.md   # 要件定義書
│   ├── architecture.md   # アーキテクチャ設計
│   └── cost-optimization.md  # コスト最適化
└── public/               # 静的ファイル
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Linter
npm run lint

# Prisma Studio
npm run db:studio

# データベーススキーマ適用
npm run db:push

# Prisma Clientの再生成
npm run db:generate
```

## デプロイ

### Vercel へのデプロイ

1. GitHubにプッシュ
2. [Vercel](https://vercel.com/) でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

## コスト試算

詳細は `docs/cost-optimization.md` を参照してください。

### 初期（10会員）
- 月額コスト: 約¥358
- 収益: ¥9,800
- 利益: ¥9,442

### 成長期（500会員）
- 月額コスト: 約¥26,000
- 収益: ¥490,000
- 利益: ¥464,000

## ライセンス

MIT
