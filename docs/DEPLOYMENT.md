# Books Fan 本番環境構築ガイド

このガイドでは、Books Fanアプリケーションを本番環境にデプロイする手順を詳しく説明します。

## 目次

1. [前提条件](#前提条件)
2. [データベースのセットアップ](#データベースのセットアップ)
3. [環境変数の設定](#環境変数の設定)
4. [Vercelへのデプロイ](#vercelへのデプロイ)
5. [デプロイ後の確認](#デプロイ後の確認)
6. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

デプロイを始める前に、以下が必要です：

- ✅ GitHubアカウント
- ✅ Vercelアカウント（無料）
- ✅ PostgreSQLデータベース（Supabase、Neon、Railway等）
- ✅ Google Cloud Console アカウント（Google Books API用）
- ✅ OpenAI APIキー
- ✅ Stripe アカウント（決済機能用）

---

## データベースのセットアップ

### オプション1: Supabase（推奨）

1. **Supabaseアカウント作成**
   - [https://supabase.com](https://supabase.com) にアクセス
   - GitHubアカウントでサインアップ

2. **新しいプロジェクトを作成**
   ```
   Project Name: books-fan
   Database Password: [強力なパスワードを設定]
   Region: Northeast Asia (Tokyo) - 最も近いリージョンを選択
   ```

3. **データベース接続情報を取得**
   - プロジェクトダッシュボード → Settings → Database
   - 「Connection string」セクションで「URI」を選択
   - 接続文字列をコピー（後で使用）
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### オプション2: Neon

1. **Neonアカウント作成**
   - [https://neon.tech](https://neon.tech) にアクセス
   - GitHubアカウントでサインアップ

2. **新しいプロジェクトを作成**
   ```
   Project Name: books-fan
   Region: Asia Pacific (Tokyo)
   Postgres version: 15
   ```

3. **接続文字列を取得**
   - ダッシュボードから「Connection string」をコピー

### オプション3: Railway

1. **Railwayアカウント作成**
   - [https://railway.app](https://railway.app) にアクセス
   - GitHubアカウントでサインアップ

2. **PostgreSQLデータベースを追加**
   - New Project → Deploy PostgreSQL
   - プロジェクト名を設定

3. **接続情報を取得**
   - PostgreSQL → Connect → Database URL をコピー

---

## 環境変数の設定

### 1. 必要な環境変数一覧

プロジェクトルートに `.env.production` ファイルを作成し、以下の変数を設定します：

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # Supabase使用時は接続文字列の末尾に?pgbouncer=true を削除したもの

# NextAuth
NEXTAUTH_URL="https://your-domain.com"  # デプロイ後のURL
NEXTAUTH_SECRET="your-secret-key"  # 生成方法は下記参照

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# LINE OAuth（オプション）
LINE_CLIENT_ID="your-line-client-id"
LINE_CLIENT_SECRET="your-line-client-secret"

# OpenAI API
OPENAI_API_KEY="sk-..."

# Stripe（決済機能）
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Google Books API
NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY="your-api-key"

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### 2. NEXTAUTH_SECRETの生成

ターミナルで以下のコマンドを実行：

```bash
openssl rand -base64 32
```

出力された文字列を `NEXTAUTH_SECRET` に設定します。

### 3. Google OAuth設定

1. **Google Cloud Console** にアクセス
   - [https://console.cloud.google.com](https://console.cloud.google.com)

2. **新しいプロジェクトを作成**
   - プロジェクト名: Books Fan

3. **OAuth 2.0クライアントIDを作成**
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Name: Books Fan Production
   - Authorized redirect URIs:
     ```
     https://your-domain.com/api/auth/callback/google
     ```

4. **クライアントIDとシークレットを取得**
   - 作成後に表示される情報を環境変数に設定

### 4. OpenAI APIキー取得

1. [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) にアクセス
2. 「Create new secret key」をクリック
3. 生成されたキーをコピー（一度しか表示されません）

### 5. Stripe設定

1. **Stripeアカウント作成**
   - [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)

2. **APIキーを取得**
   - Developers → API keys
   - Publishable key と Secret key をコピー

3. **Webhookエンドポイントを設定**
   - Developers → Webhooks → Add endpoint
   - Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Signing secret をコピー

---

## Vercelへのデプロイ

### 1. GitHubにプッシュ

```bash
# まだGitリポジトリを作成していない場合
git init
git add .
git commit -m "Initial commit"

# GitHubリポジトリを作成後
git remote add origin https://github.com/your-username/books-fan.git
git branch -M main
git push -u origin main
```

### 2. Vercelプロジェクトを作成

1. **Vercelにログイン**
   - [https://vercel.com](https://vercel.com)
   - GitHubアカウントでサインアップ

2. **新しいプロジェクトをインポート**
   - Add New → Project
   - GitHubリポジトリを選択: `books-fan`
   - Import をクリック

3. **プロジェクト設定**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build (デフォルト)
   Output Directory: .next (デフォルト)
   Install Command: npm install (デフォルト)
   ```

4. **環境変数を設定**
   - Environment Variables セクションで、すべての環境変数を追加
   - `.env.production` の内容をコピー＆ペースト
   - Environment: Production を選択

5. **Deploy をクリック**
   - ビルドが開始されます（5-10分程度）

### 3. データベースマイグレーション

デプロイ後、データベーススキーマを作成する必要があります：

**方法1: ローカルから実行（推奨）**

```bash
# 本番データベースURLを一時的に設定
export DATABASE_URL="postgresql://..."

# Prismaマイグレーションを実行
npx prisma migrate deploy

# シードデータを投入（オプション）
npx prisma db seed
```

**方法2: Vercel CLIから実行**

```bash
# Vercel CLIをインストール
npm i -g vercel

# Vercelにログイン
vercel login

# プロジェクトにリンク
vercel link

# 環境変数を取得してマイグレーション実行
vercel env pull .env.production
npx prisma migrate deploy
```

### 4. カスタムドメインの設定（オプション）

1. **Vercelダッシュボード**
   - プロジェクト → Settings → Domains

2. **ドメインを追加**
   - 例: `books-fan.com`
   - DNSレコードを設定（指示に従う）

3. **SSL証明書**
   - 自動的に生成されます

---

## デプロイ後の確認

### 1. 基本機能チェック

- [ ] トップページが正しく表示される
- [ ] ユーザー登録・ログインができる
- [ ] 本の検索ができる
- [ ] レビュー投稿ができる
- [ ] AI要約生成ができる（PREMIUM機能）
- [ ] マインドマップ生成ができる（PREMIUM機能）

### 2. データベース接続確認

```bash
# Prisma Studioでデータベースを確認
npx prisma studio
```

### 3. エラーログ確認

Vercelダッシュボード → プロジェクト → Logs でエラーを確認

### 4. パフォーマンステスト

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)

---

## トラブルシューティング

### ビルドエラーが発生する

**問題**: `npm run build` でエラーが発生

**解決策**:
```bash
# ローカルでビルドをテスト
npm run build

# 型エラーをチェック
npm run type-check

# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
```

### データベース接続エラー

**問題**: `PrismaClientInitializationError`

**解決策**:
1. `DATABASE_URL` が正しく設定されているか確認
2. データベースが起動しているか確認
3. IPアドレス制限がある場合、Vercelのアドレスを許可
   - Supabase: Settings → Database → Connection pooling → Add Vercel IP ranges

### 環境変数が反映されない

**問題**: 環境変数が `undefined`

**解決策**:
1. Vercelダッシュボードで環境変数を確認
2. `NEXT_PUBLIC_` プレフィックスが必要な変数を確認
3. デプロイメントを再実行
   ```bash
   vercel --prod
   ```

### OAuth認証エラー

**問題**: Google/LINEログインができない

**解決策**:
1. Google Cloud Console でリダイレクトURIを確認
   ```
   https://your-domain.com/api/auth/callback/google
   ```
2. `NEXTAUTH_URL` が正しく設定されているか確認
3. OAuth同意画面が承認されているか確認

### Stripe Webhookエラー

**問題**: 決済が正しく処理されない

**解決策**:
1. Webhook URLが正しいか確認
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
2. Webhook signing secretが正しいか確認
3. Stripeダッシュボードでイベントログを確認

### メモリ不足エラー

**問題**: ビルド時に `JavaScript heap out of memory`

**解決策**:

`package.json` に以下を追加:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

---

## セキュリティチェックリスト

デプロイ前に以下を確認してください：

- [ ] すべての環境変数が `.env.local` に記載され、Gitにコミットされていない
- [ ] `.gitignore` に `.env*` が含まれている
- [ ] `NEXTAUTH_SECRET` が本番環境用に新しく生成されている
- [ ] Stripe APIキーが本番用（`sk_live_...`）になっている
- [ ] データベースパスワードが強力である
- [ ] OAuth リダイレクトURIが本番URLになっている
- [ ] CORS設定が適切である

---

## 継続的デプロイメント

Vercelは自動的にGitHubと連携します：

- `main` ブランチへのプッシュ → 本番環境へ自動デプロイ
- プルリクエスト作成 → プレビュー環境を自動作成

### デプロイ前のチェック

```bash
# ローカルでビルドテスト
npm run build

# 型チェック
npm run type-check

# リント
npm run lint

# テスト（設定している場合）
npm run test
```

---

## バックアップとモニタリング

### データベースバックアップ

**Supabase**:
- 自動バックアップが有効（Pro プラン以上）
- 手動バックアップ: Dashboard → Database → Backups

**Neon**:
- 自動的に毎日バックアップ
- Point-in-time recovery が利用可能

### モニタリングツール

1. **Vercel Analytics**
   - ダッシュボード → Analytics
   - パフォーマンス、訪問者数を確認

2. **Sentry（エラー追跡）**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Uptime Monitoring**
   - [UptimeRobot](https://uptimerobot.com/)
   - [Pingdom](https://www.pingdom.com/)

---

## スケーリング

アクセスが増加した場合の対応：

### データベース
- **Supabase**: Pro プランにアップグレード
- **Neon**: Compute resources を増強

### Vercel
- Pro プランでパフォーマンス向上
- Edge Functions の活用

### 画像最適化
- Cloudinary または Vercel Image Optimization を使用
- Next.js の `Image` コンポーネントを活用

---

## まとめ

本番環境へのデプロイは以下の手順で完了します：

1. ✅ データベースをセットアップ（Supabase推奨）
2. ✅ 環境変数を設定（Google OAuth, OpenAI, Stripe等）
3. ✅ GitHubにコードをプッシュ
4. ✅ Vercelでプロジェクトをインポート
5. ✅ 環境変数をVercelに設定
6. ✅ デプロイを実行
7. ✅ データベースマイグレーションを実行
8. ✅ 動作確認とテスト

何か問題が発生した場合は、[トラブルシューティング](#トラブルシューティング)セクションを参照してください。

---

**次のステップ**:
- カスタムドメインの設定
- メール通知の設定
- アナリティクスの導入
- SEO最適化
- パフォーマンス最適化

デプロイ成功をお祈りします！ 🚀
