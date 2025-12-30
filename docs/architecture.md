# Books Fan - 推奨アーキテクチャとサービス構成

## 1. 技術スタック概要

### フロントエンド
**Next.js 14+ (App Router)**
- React 18+
- TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion（アニメーション）

**理由**:
- SEO最適化（非会員の閲覧体験向上）
- サーバーサイドレンダリング（SSR）とスタティック生成（SSG）の使い分け
- App Routerによる直感的なルーティング
- Tailwind CSSで高速な UI 開発
- shadcn/uiでモダンで洗練されたコンポーネント

### バックエンド
**Next.js API Routes + tRPC**
- Next.js API Routes（サーバーレス関数）
- tRPC（型安全なAPI）
- Zod（バリデーション）

**または（より大規模な場合）**
**NestJS + GraphQL**
- NestJS（Node.js フレームワーク）
- GraphQL（柔軟なデータ取得）
- TypeORM または Prisma

**推奨**: 初期は Next.js + tRPC、スケール時に検討

### データベース
**PostgreSQL（Supabase または Neon）**
- リレーショナルデータに最適
- JSONBサポート（AI要点データの保存）
- 全文検索機能
- スケーラビリティ

**代替案**:
- Planetscale（MySQL互換）
- Supabase（PostgreSQL + リアルタイム機能）

### ORM
**Prisma**
- TypeScript完全サポート
- 直感的なスキーマ定義
- マイグレーション管理
- 優れた開発者体験

### 認証
**NextAuth.js（Auth.js）**
- Google OAuth簡単連携
- セッション管理
- JWT/Database セッション
- 拡張性（将来的な認証方法追加）

### 決済
**Stripe**
- サブスクリプション管理
- Checkout Session（簡単な実装）
- Customer Portal（ユーザー自身でプラン管理）
- Webhook（イベント通知）
- テストモードで開発容易

### AI
**OpenAI API（GPT-4o または GPT-4o-mini）**
- 要点生成: GPT-4o-mini（コスト効率）
- 複雑な分析: GPT-4o
- 構造化出力（Structured Outputs）で一貫性のあるデータ

**または**
**Anthropic Claude API（Claude 3.5 Sonnet）**
- 長文処理に強い（本の内容分析）
- 正確な要約
- コスト効率的

**コスト最適化戦略**:
- キャッシング（同じ本の要点は再利用）
- Redis でキャッシュ管理
- ユーザーごとの使用制限

### ストレージ
**Vercel Blob または Cloudflare R2**
- カバー画像
- ユーザープロフィール画像
- AI要点可視化の画像エクスポート

**代替**: AWS S3 + CloudFront

### 検索
**Algolia または Meilisearch**
- 高速な書籍検索
- ファセット検索（ジャンル、評価フィルター）
- タイポ許容

**代替**: PostgreSQL全文検索（初期は十分）

### キャッシング
**Upstash Redis**
- AI応答のキャッシュ
- セッション管理
- レート制限
- サーバーレス環境に最適

### ホスティング
**Vercel**
- Next.jsに最適化
- エッジネットワーク
- 自動スケーリング
- プレビューデプロイ
- 簡単なCI/CD

**代替**: Netlify, AWS Amplify

### モニタリング・分析
**Vercel Analytics + Sentry**
- パフォーマンス監視
- エラートラッキング
- リアルタイムアラート

**ビジネス分析**:
- Stripe Dashboard（収益）
- Google Analytics 4（ユーザー行動）
- Mixpanel（ユーザーエンゲージメント）

## 2. アーキテクチャ図

```
┌─────────────────────────────────────────────────────────┐
│                     ユーザー                              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 Vercel Edge Network                      │
│                  (CDN + Edge Functions)                  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js 14 Application                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  App Router  │  │   tRPC API   │  │  NextAuth.js │  │
│  │   (Pages)    │  │   Routes     │  │   (Auth)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────┬──────────────────┬──────────────────┬──────────┘
        │                  │                  │
        │                  │                  │
┌───────▼────────┐ ┌──────▼────────┐ ┌───────▼──────────┐
│   Supabase     │ │  Upstash      │ │   Vercel Blob    │
│  (PostgreSQL)  │ │   Redis       │ │   (Storage)      │
│   + Prisma     │ │  (Cache)      │ │                  │
└────────────────┘ └───────────────┘ └──────────────────┘
        │
        │
┌───────▼──────────────────────────────────────────────────┐
│                   外部サービス連携                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Stripe  │ │ OpenAI   │ │  Google  │ │ Algolia  │   │
│  │ Payments │ │   API    │ │  Books   │ │ Search   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────────────────────────────────────────┘
        │
        │
┌───────▼──────────────────────────────────────────────────┐
│            モニタリング・分析                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │  Sentry  │ │ Vercel   │ │   GA4    │                 │
│  │  Errors  │ │Analytics │ │          │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
└──────────────────────────────────────────────────────────┘
```

## 3. ディレクトリ構造（Next.js App Router）

```
books-fan/
├── prisma/
│   ├── schema.prisma          # データベーススキーマ
│   └── migrations/            # マイグレーションファイル
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # 認証関連ページグループ
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (marketing)/      # マーケティングページ
│   │   │   ├── page.tsx      # トップページ
│   │   │   ├── about/
│   │   │   └── pricing/
│   │   ├── books/            # 本関連ページ
│   │   │   ├── page.tsx      # 本一覧
│   │   │   ├── [bookId]/     # 本詳細
│   │   │   └── search/
│   │   ├── dashboard/        # ダッシュボード
│   │   │   ├── page.tsx
│   │   │   ├── reviews/
│   │   │   ├── summaries/
│   │   │   └── settings/
│   │   ├── api/              # API Routes
│   │   │   ├── auth/
│   │   │   ├── trpc/
│   │   │   └── webhooks/     # Stripe webhooks
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/           # Reactコンポーネント
│   │   ├── ui/              # shadcn/ui コンポーネント
│   │   ├── book/
│   │   │   ├── BookCard.tsx
│   │   │   ├── BookDetail.tsx
│   │   │   └── ReviewList.tsx
│   │   ├── ai/
│   │   │   ├── SummaryViewer.tsx
│   │   │   └── MindMap.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   └── shared/
│   │
│   ├── lib/                  # ユーティリティ
│   │   ├── prisma.ts        # Prismaクライアント
│   │   ├── auth.ts          # NextAuth設定
│   │   ├── stripe.ts        # Stripe設定
│   │   └── utils.ts
│   │
│   ├── server/              # サーバーサイドロジック
│   │   ├── trpc/
│   │   │   ├── router/
│   │   │   │   ├── book.ts
│   │   │   │   ├── review.ts
│   │   │   │   ├── ai.ts
│   │   │   │   └── user.ts
│   │   │   ├── context.ts
│   │   │   └── trpc.ts
│   │   ├── services/
│   │   │   ├── openai.ts
│   │   │   ├── googleBooks.ts
│   │   │   └── recommendation.ts
│   │   └── db/
│   │
│   ├── hooks/               # カスタムフック
│   │   ├── useBook.ts
│   │   ├── useReview.ts
│   │   └── useSubscription.ts
│   │
│   ├── types/               # TypeScript型定義
│   │   ├── book.ts
│   │   ├── user.ts
│   │   └── ai.ts
│   │
│   └── config/              # 設定ファイル
│       ├── site.ts
│       └── constants.ts
│
├── public/                  # 静的ファイル
│   ├── images/
│   └── icons/
│
├── tests/                   # テスト
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local              # 環境変数
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 4. データフロー

### 4.1 ユーザー登録・認証フロー

```
1. ユーザーが「Googleでログイン」をクリック
   ↓
2. NextAuth.js が Google OAuth フローを開始
   ↓
3. Googleで認証後、コールバック
   ↓
4. NextAuth.js がユーザー情報を取得
   ↓
5. Prisma経由でユーザーをDBに保存/更新
   ↓
6. セッションを作成（JWTまたはDatabase）
   ↓
7. ダッシュボードにリダイレクト
```

### 4.2 レビュー投稿フロー

```
1. ユーザーがレビューフォームに入力
   ↓
2. フロントエンドでバリデーション（Zod）
   ↓
3. tRPC mutation を呼び出し
   ↓
4. サーバーで権限チェック（会員種別）
   ↓
5. Prismaでデータベースに保存
   ↓
6. 本の平均評価を再計算
   ↓
7. キャッシュを更新（Redis）
   ↓
8. フロントエンドに成功レスポンス
   ↓
9. UIを更新（楽観的更新）
```

### 4.3 AI要点生成フロー

```
1. 有料会員が「AI要点生成」をクリック
   ↓
2. 使用回数チェック（月間制限）
   ↓
3. キャッシュチェック（Redis）
   - ヒット → キャッシュから返す
   - ミス → 次へ
   ↓
4. ユーザーのレビュー/ノートを取得
   ↓
5. OpenAI API にリクエスト
   - プロンプト: 「以下のレビューから要点を抽出」
   - Structured Outputs で JSON形式
   ↓
6. レスポンスを整形
   ↓
7. データベースに保存（AISummary）
   ↓
8. Redisにキャッシュ（7日間）
   ↓
9. 使用回数をインクリメント
   ↓
10. フロントエンドに返す
   ↓
11. マインドマップを表示
```

### 4.4 サブスクリプション管理フロー

```
【新規登録】
1. ユーザーが「プレミアムに登録」をクリック
   ↓
2. Stripe Checkout Session を作成
   ↓
3. Stripeのチェックアウトページにリダイレクト
   ↓
4. ユーザーが支払い情報を入力
   ↓
5. 支払い成功
   ↓
6. Stripe が Webhook を送信
   ↓
7. Next.js API Route でWebhookを受信
   ↓
8. Prismaでユーザーのプランを更新
   ↓
9. サンクスページにリダイレクト

【定期更新】
1. Stripeが自動的に請求
   ↓
2. 成功 → Webhookで通知 → DB更新
   ↓
3. 失敗 → Webhookで通知 → ステータスをPAST_DUEに
   ↓
4. ユーザーに通知メール

【キャンセル】
1. ユーザーがCustomer Portalでキャンセル
   ↓
2. Stripe が Webhook を送信
   ↓
3. ステータスをCANCELEDに更新
   ↓
4. 期間終了まで利用可能
```

## 5. セキュリティ対策

### 5.1 認証・認可
- NextAuth.js でセッション管理
- HTTPOnly Cookie（XSS対策）
- CSRF トークン
- API Route でのユーザー権限チェック

### 5.2 データ保護
- 環境変数で機密情報管理（.env.local）
- Vercel環境変数で本番環境管理
- Stripeシークレットキーの厳密管理
- Webhook署名検証

### 5.3 API保護
- レート制限（Upstash Rate Limit）
- 入力バリデーション（Zod）
- SQLインジェクション対策（Prisma ORM）
- XSS対策（React自動エスケープ）

### 5.4 HTTPS
- Vercelで自動HTTPS
- HSTS（HTTP Strict Transport Security）

## 6. パフォーマンス最適化

### 6.1 フロントエンド
- **画像最適化**: Next.js Image コンポーネント
- **コード分割**: 動的インポート（lazy loading）
- **キャッシング**: SWR または React Query
- **静的生成**: 公開ページはSSG（getStaticProps）
- **増分静的再生成**: ISR（revalidate）

### 6.2 バックエンド
- **データベースクエリ最適化**:
  - インデックス作成
  - N+1問題の回避（Prisma include）
  - 適切なページネーション
- **キャッシング戦略**:
  - Redis で頻繁なクエリ結果をキャッシュ
  - AI応答のキャッシュ（同じ本）
- **CDN活用**:
  - Vercel Edge Network
  - 静的アセットの配信

### 6.3 AI APIコスト削減
- **キャッシング**: 同じ本の要点は再利用
- **モデル選択**:
  - GPT-4o-mini（安価・高速）
  - GPT-4o（高品質が必要な場合のみ）
- **プロンプト最適化**: トークン数削減
- **バッチ処理**: 複数リクエストをまとめる

## 7. スケーリング戦略

### 7.1 水平スケーリング
- Vercelの自動スケーリング
- サーバーレス関数（ステートレス）
- データベース: Supabase/Neon（自動スケーリング）

### 7.2 データベース
- **読み取りレプリカ**: 読み取り負荷分散
- **シャーディング**: 将来的な検討
- **コネクションプール**: Prismaのコネクション管理

### 7.3 キャッシング階層
1. ブラウザキャッシュ
2. CDN（Vercel Edge）
3. Redis（サーバーサイド）
4. データベースクエリキャッシュ

## 8. 開発・デプロイフロー

### 8.1 開発環境
```bash
# ローカル開発
npm run dev

# データベースマイグレーション
npx prisma migrate dev

# Prisma Studio（DB GUI）
npx prisma studio
```

### 8.2 CI/CD（Vercel）
```
1. GitHubにプッシュ
   ↓
2. Vercel が自動的にビルド
   ↓
3. プレビューデプロイ（ブランチごと）
   ↓
4. main ブランチ → 本番デプロイ
```

### 8.3 環境変数管理
- `.env.local`: ローカル開発
- Vercel Dashboard: 本番環境
- 環境別に設定（Development, Preview, Production）

## 9. コスト試算（月額）

### スモールスタート（〜1,000ユーザー、100有料会員）
- Vercel Pro: $20
- Supabase Pro: $25
- Upstash Redis: $10
- Vercel Blob: $5
- OpenAI API: $50-100（100会員 × 10回/月 × $0.05）
- Stripe手数料: $30（¥980 × 100会員 × 3.6%）
- Sentry: $26
- **合計**: 約 $166-216/月（約¥24,000-31,000）

### ミディアムスケール（〜10,000ユーザー、1,000有料会員）
- Vercel Pro: $20
- Supabase Pro: $50-100（スケール）
- Upstash Redis: $30
- Vercel Blob: $20
- OpenAI API: $500-1,000
- Stripe手数料: $353（¥980 × 1,000会員 × 3.6%）
- Sentry: $99
- Algolia: $50
- **合計**: 約 $1,122-1,672/月（約¥165,000-245,000）

### 収益性
- 1,000有料会員 × ¥980 = ¥980,000/月
- コスト: 約¥245,000/月
- 粗利: 約¥735,000/月（利益率 75%）

## 10. 推奨開発順序

### ステップ1: プロジェクトセットアップ
1. Next.js + TypeScript プロジェクト作成
2. Tailwind CSS + shadcn/ui セットアップ
3. Prisma + Supabase セットアップ
4. NextAuth.js（Google OAuth）

### ステップ2: 基本機能実装
1. 認証フロー
2. 本の検索・表示（Google Books API）
3. レビュー投稿・表示
4. ユーザープロフィール

### ステップ3: 決済機能
1. Stripe連携
2. サブスクリプション管理
3. Webhook処理

### ステップ4: AI機能
1. OpenAI API連携
2. 要点生成
3. 基本的な可視化

### ステップ5: 高度な機能
1. 推薦アルゴリズム
2. 読者カテゴリ分類
3. マインドマップ可視化

### ステップ6: 最適化・改善
1. パフォーマンス最適化
2. SEO対策
3. アクセシビリティ改善
4. テスト追加

## 11. まとめ

### なぜこのスタックか？

1. **Next.js**: フルスタックフレームワークで開発効率最大化
2. **TypeScript**: 型安全性でバグ削減、保守性向上
3. **Vercel**: Next.jsに最適化、デプロイが簡単
4. **Prisma**: 型安全なORM、優れたDX
5. **Supabase**: PostgreSQL + 追加機能、スケーラブル
6. **Stripe**: 決済のデファクトスタンダード、簡単実装
7. **OpenAI**: 高品質なAI、構造化出力
8. **shadcn/ui**: モダンで美しいUI、カスタマイズ容易

このスタックは、**モダン**で**メンテナンス性が高く**、**スケーラブル**で、**開発者体験が優れている**という要件を全て満たしています。
