# Books Fan コスト最適化デプロイガイド

コストを最優先に、スケーラビリティと保守運用性も考慮したデプロイ戦略です。

## 📊 推奨構成: Vercel + Neon

### なぜこの組み合わせが最適か

✅ **コスト**: 無料枠で十分なスタート、段階的な課金
✅ **スケーラビリティ**: トラフィック増加に自動対応
✅ **保守性**: 自動デプロイ、簡単な運用
✅ **パフォーマンス**: エッジネットワーク、高速DB

---

## 💰 コスト分析

### 無料枠で運用可能（月間コスト: ¥0）

| サービス | 無料枠 | 制限 | 超過時の料金 |
|---------|--------|------|-------------|
| **Vercel** | 無料 | 100GB 帯域幅<br>100 実行時間（時間）<br>6,000 分ビルド時間 | $20/月〜 |
| **Neon** | 無料 | 0.5GB ストレージ<br>自動休止機能<br>3つのプロジェクト | $19/月〜 |
| **合計** | **¥0/月** | 小〜中規模に十分 | - |

### 目安トラフィック（無料枠内）

- **月間訪問者**: 〜50,000人
- **ページビュー**: 〜200,000 PV
- **データベース**: 〜500MB
- **AI要約生成**: 従量課金（OpenAI）

### 有料化が必要になるタイミング

**Vercel Pro ($20/月) が必要な場合:**
- 月間帯域幅が 100GB 超過
- チーム機能が必要
- より高速なビルド時間が必要
- アナリティクス詳細が必要

**Neon Scale ($19/月) が必要な場合:**
- データベースが 0.5GB 超過
- 自動休止を無効化したい
- より高速なクエリが必要

---

## 🚀 デプロイ手順（最小コスト版）

### 1. Neon データベースセットアップ（無料）

#### 1.1 アカウント作成

1. [https://neon.tech](https://neon.tech) にアクセス
2. GitHubアカウントでサインアップ（無料）

#### 1.2 プロジェクト作成

```text
Project Name: books-fan
Region: Asia Pacific (Tokyo)  ← 重要: 日本リージョン選択
Postgres version: 16（最新を選択）
```

#### 1.3 接続情報取得

1. プロジェクトダッシュボードを開く
2. 「Connection Details」セクションから接続文字列をコピー

```bash
# Pooled connection (Vercel推奨)
DATABASE_URL="postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Direct connection (Prisma Migrate用)
DIRECT_URL="postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

**💡 Neonのコスト削減Tips:**
- ✅ 自動休止機能を有効化（デフォルト）→ 使わない時は課金なし
- ✅ Tokyo リージョン選択 → レイテンシ低減
- ✅ 定期的にデータベースサイズを確認

### 2. 環境変数準備

`.env.production` を作成:

```env
# Database (Neon)
DATABASE_URL="postgresql://..." # Pooled connection
DIRECT_URL="postgresql://..."   # Direct connection

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-generated-secret"

# Google OAuth (無料)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# OpenAI API (従量課金)
OPENAI_API_KEY="sk-..."

# Google Books API (無料枠あり)
NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY="your-api-key"

# Stripe (決済手数料のみ)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**💡 APIコスト削減Tips:**
- OpenAI: `gpt-4o-mini` モデル使用（安価）
- Google Books API: 無料枠 1,000リクエスト/日
- キャッシュ戦略でAPI呼び出しを削減

### 3. Vercel デプロイ（無料）

#### 3.1 GitHubプッシュ

```bash
git add .
git commit -m "Production ready"
git push origin main
```

#### 3.2 Vercel インポート

1. [https://vercel.com](https://vercel.com) にアクセス
2. GitHubでサインイン（無料）
3. 「Add New」→「Project」
4. GitHubリポジトリを選択: `books-fan`
5. 「Import」をクリック

#### 3.3 環境変数設定

```text
Settings → Environment Variables

すべての環境変数を追加:
✓ DATABASE_URL
✓ DIRECT_URL
✓ NEXTAUTH_SECRET
✓ NEXTAUTH_URL
✓ その他...

Environment: Production
```

#### 3.4 デプロイ実行

「Deploy」をクリック → 3-5分で完了

**💡 Vercelのコスト削減Tips:**
- ✅ 画像最適化は Next.js の Image コンポーネント使用
- ✅ ISR（Incremental Static Regeneration）でビルド時間削減
- ✅ Edge Functions は必要最小限に

### 4. データベースマイグレーション

ローカルから実行（推奨）:

```bash
# 本番データベースURLを設定
export DATABASE_URL="postgresql://..."
export DIRECT_URL="postgresql://..."

# Prismaマイグレーション実行
npx prisma migrate deploy

# Prisma Client 生成
npx prisma generate
```

---

## 📈 スケーリング戦略

### フェーズ1: 無料枠（0-50k訪問者/月）

現状の構成で十分:
- Vercel Free
- Neon Free
- **月間コスト: ¥0**

### フェーズ2: 小規模課金（50k-200k訪問者/月）

必要な場合のみアップグレード:
- Vercel Free（継続）
- Neon Scale: $19/月（データベースが成長した場合）
- **月間コスト: 〜¥2,800**

### フェーズ3: 中規模（200k-1M訪問者/月）

トラフィック増加時:
- Vercel Pro: $20/月
- Neon Scale: $19/月
- **月間コスト: 〜¥5,800**

### フェーズ4: 大規模（1M+ 訪問者/月）

本格的なスケール:
- Vercel Pro + 超過料金
- Neon Business: $69/月
- CDN最適化検討
- **月間コスト: 〜¥15,000+**

---

## 🔧 コスト最適化テクニック

### 1. データベース最適化（Neon）

#### 自動休止の活用

Neonは5分間アクセスがないと自動休止し、課金停止します。

```typescript
// Prisma接続プーリング設定
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

#### インデックス最適化

頻繁に検索されるフィールドにインデックス:

```prisma
model Book {
  id            String   @id @default(cuid())
  googleBooksId String   @unique
  title         String   @db.VarChar(500)
  author        String   @db.VarChar(200)

  @@index([title])
  @@index([author])
  @@index([googleBooksId])
}
```

#### 定期クリーンアップ

古いデータを削除してストレージを節約:

```sql
-- 1年以上前の未公開レビューを削除
DELETE FROM "Review"
WHERE "isPublic" = false
AND "createdAt" < NOW() - INTERVAL '1 year';
```

### 2. Vercel 最適化

#### 画像最適化

```typescript
// Next.js Image コンポーネント使用
import Image from "next/image";

<Image
  src={book.coverImageUrl}
  alt={book.title}
  width={200}
  height={300}
  loading="lazy"
  quality={80} // 品質を下げて転送量削減
/>
```

#### ISR（Incremental Static Regeneration）

```typescript
// 本の詳細ページをISRで最適化
export async function generateStaticParams() {
  // 人気の本だけ事前生成
  const popularBooks = await getPopularBooks(50);
  return popularBooks.map(book => ({ id: book.googleBooksId }));
}

export const revalidate = 3600; // 1時間ごとに再生成
```

#### エッジキャッシュ活用

```typescript
// API Routes でキャッシュヘッダー設定
export async function GET(request: Request) {
  const data = await fetchData();

  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/json',
    },
  });
}
```

### 3. OpenAI API コスト削減

#### モデル選択

```typescript
// gpt-4o-mini 使用（安価）
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini", // ← 重要
  messages: [...],
  max_tokens: 500, // トークン数制限
  temperature: 0.7,
});
```

#### キャッシュ戦略

```typescript
// AI要約のキャッシュ
async function generateAISummary(reviewId: string) {
  // 既存の要約をチェック
  const cached = await prisma.aISummary.findUnique({
    where: { reviewId },
  });

  if (cached) return cached; // キャッシュヒット

  // 新規生成（API課金）
  const summary = await callOpenAI(...);
  return summary;
}
```

#### 月次使用制限

```typescript
// プレミアムユーザーの月次制限（30回）
if (user.aiUsageCount >= 30) {
  throw new Error("月次制限に達しました");
}
```

**💰 OpenAI コスト目安:**
- gpt-4o-mini: $0.15 / 1M input tokens
- 1要約あたり: 約 $0.001-0.002
- 月1,000要約: 約 $1-2

### 4. ファイルストレージ最適化

#### オプション1: Vercel Blob（推奨）

```bash
npm install @vercel/blob
```

```typescript
import { put } from '@vercel/blob';

const blob = await put('avatars/user.jpg', file, {
  access: 'public',
  token: process.env.BLOB_READ_WRITE_TOKEN,
});
```

**料金:**
- 無料枠: 500MB ストレージ、5GB 転送
- 超過: $0.15/GB ストレージ、$0.30/GB 転送

#### オプション2: Cloudinary（無料枠大）

```bash
npm install cloudinary
```

**料金:**
- 無料枠: 25GB ストレージ、25GB 転送/月
- 画像最適化機能込み

---

## 📊 モニタリングとコスト管理

### 1. Vercel Analytics（無料）

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**確認できる指標:**
- ページビュー
- 帯域幅使用量
- ビルド時間

### 2. Neon メトリクス

ダッシュボードで確認:
- ストレージ使用量
- アクティブ時間
- クエリ統計

### 3. OpenAI Usage Dashboard

[https://platform.openai.com/usage](https://platform.openai.com/usage)

- API使用量
- コスト
- トークン数

---

## 🎯 代替案の比較

### オプション A: Cloudflare Pages + Neon

**メリット:**
- 無制限の帯域幅（Cloudflare Pages）
- より低コストでスケール可能
- エッジネットワークが強力

**デメリット:**
- Next.js の一部機能に制限あり
- セットアップがやや複雑
- サーバーレス関数に時間制限

**推奨ケース:**
- トラフィックが非常に多い
- 静的コンテンツ中心

### オプション B: Railway（オールインワン）

**メリット:**
- シンプルな料金体系（$5/月〜）
- アプリとDBを一箇所で管理
- セットアップが簡単

**デメリット:**
- スケールが高コスト
- Vercelより遅いデプロイ

**推奨ケース:**
- シンプルさ重視
- 小規模チーム

### オプション C: VPS 自己ホスティング

**メリット:**
- 完全なコントロール
- 固定費用（$5-20/月）
- リソース使い放題

**デメリット:**
- 運用コストが高い
- セキュリティ管理が必要
- スケーリングが手動

**推奨ケース:**
- 技術力が高い
- 長期運用予定

---

## 📋 最終推奨構成

### スタートアップ〜中規模向け

```
✅ Hosting: Vercel（無料 → $20/月）
✅ Database: Neon（無料 → $19/月）
✅ Storage: Vercel Blob / Cloudinary（無料枠）
✅ Analytics: Vercel Analytics（無料）
✅ Monitoring: Vercel Logs（無料）

初期コスト: ¥0/月
成長時: 〜¥6,000/月
```

### 理由

1. **コスト効率**: 無料で始められ、段階的に課金
2. **スケーラビリティ**: 自動スケール、手動作業不要
3. **保守性**: 自動デプロイ、簡単なロールバック
4. **パフォーマンス**: グローバルCDN、高速DB
5. **開発体験**: Next.js に最適化、デバッグ簡単

---

## 🚨 コスト超過アラート設定

### Vercel アラート設定

1. Settings → Usage & Billing
2. Email notifications を有効化
3. 閾値設定:
   - 帯域幅: 80GB（100GBの80%）
   - ビルド時間: 5,000分

### Neon アラート設定

1. Dashboard → Settings
2. Usage alerts を有効化
3. ストレージ: 400MB（0.5GBの80%）

### OpenAI 予算設定

1. [https://platform.openai.com/account/billing/limits](https://platform.openai.com/account/billing/limits)
2. Hard limit 設定: $10/月（推奨）
3. Email alert: $8（80%）

---

## 📝 まとめ

### ✅ Do's（推奨）

- Vercel + Neon で無料から始める
- ISR、キャッシュで最適化
- 画像は Next.js Image コンポーネント
- API呼び出しをキャッシュ
- 定期的にコスト確認

### ❌ Don'ts（非推奨）

- 最初から有料プランにしない
- 最適化なしでデプロイしない
- OpenAI API を無制限に使用しない
- モニタリングなしで運用しない

### 🎯 成功のポイント

1. **段階的な成長**: 無料 → 小規模課金 → スケール
2. **継続的な最適化**: 定期的にパフォーマンス確認
3. **コスト意識**: 使用量を常にモニタリング

---

**初期投資ゼロで始められる、スケーラブルな構成です！** 🚀

何か不明な点があれば、お気軽にお聞きください。
