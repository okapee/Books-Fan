# Books Fan デプロイチェックリスト

本番環境へのデプロイ時に使用するチェックリストです。

## 🔐 環境変数管理について（重要）

### .env.production の扱い

**Q: .env.production はGitHubにpushするのでしょうか？**
**A: いいえ、絶対にpushしません！**

- `.gitignore` で除外されているため、GitHubにpushされることはありません
- `.env.production` は**ローカルでの参照用メモ**として作成します
- 実際の本番環境では、**Vercelのダッシュボードで直接環境変数を設定**します

### 環境変数の管理フロー

```
1. ローカル: .env.production を作成（参照用）
   ↓
2. 値をコピー
   ↓
3. Vercel: ダッシュボード → Settings → Environment Variables で設定
   ↓
4. Vercelで安全に管理（GitHubには保存されない）
```

### OAuth認証情報について

**Q: Google OAuthとLINE OAuthは開発環境でも本番環境でも値は変わらない？**
**A: いいえ、開発環境と本番環境で異なる値を使用します！**

**理由: リダイレクトURIが異なる**

- **開発環境**: `http://localhost:3000/api/auth/callback/google`
- **本番環境**: `https://books-fan.vercel.app/api/auth/callback/google`

**推奨設定:**
- Google Cloud Console で2つの OAuth クライアントIDを作成
  - 1つ: 開発用（localhost用）
  - 1つ: 本番用（Vercel URL用）
- LINEも同様に、開発用と本番用で別のチャネルを作成

---

## 📋 デプロイ前チェック

### 環境準備

- [ ] GitHubアカウント作成済み
- [ ] Vercelアカウント作成済み
- [ ] PostgreSQLデータベース準備完了
  - [ ] Neon（推奨 - コスト最適化）
  - [ ] 接続文字列を取得済み
- [ ] Google Cloud Console アカウント作成済み
- [ ] OpenAI APIキー取得済み
- [ ] Stripe アカウント作成済み（決済機能使用時）

### コード準備

- [ ] すべての変更をコミット済み
- [ ] ローカルでビルド成功を確認
  ```bash
  npm run build
  ```
- [ ] 型エラーなし
  ```bash
  npm run type-check
  ```
- [ ] リントエラーなし
  ```bash
  npm run lint
  ```

## 🗄️ データベースセットアップ

### Neon（推奨 - コスト最適化）

- [ ] Neon プロジェクト作成（https://neon.tech）
  - Project Name: `books-fan`
  - Region: `Asia Pacific (Tokyo)`
  - Postgres version: `16`（最新を選択）
- [ ] 接続文字列を取得
  - Dashboard → Connection Details
  - **Pooled connection** をコピー（DATABASE_URL用）
  - **Direct connection** をコピー（DIRECT_URL用・同じでOK）
- [ ] `DATABASE_URL` と `DIRECT_URL` を安全な場所に記録

## 🔑 環境変数設定

**⚠️ 重要なセキュリティ情報:**
- `.env.production` は**ローカルでの参照用メモ**です
- **GitHubにpushしません**（.gitignoreで除外済み）
- 実際の本番環境では**Vercelダッシュボードで設定**します

ローカルに `.env.production` を作成し、以下を設定：

### 必須項目

- [ ] `DATABASE_URL` - Neon Pooled connection
  ```
  postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
  ```
- [ ] `DIRECT_URL` - Neon Direct connection（同じ接続文字列でOK）
- [ ] `NEXTAUTH_SECRET` - 本番用に新しく生成:
  ```bash
  openssl rand -base64 32
  ```
  **⚠️ 開発環境とは異なる値を使用**
- [ ] `NEXTAUTH_URL` - 本番URL（例: `https://books-fan.vercel.app`）

### OAuth設定（本番用の新しい認証情報が必要）

**⚠️ 重要: 開発環境と本番環境で値は異なります！**

- [ ] **Google OAuth（本番用）**
  - [ ] Google Cloud Console で新しいOAuthクライアントID作成
    - Application type: Web application
    - Name: Books Fan Production
  - [ ] リダイレクトURI設定:
    ```
    https://books-fan.vercel.app/api/auth/callback/google
    ```
  - [ ] `GOOGLE_CLIENT_ID`（本番用）
  - [ ] `GOOGLE_CLIENT_SECRET`（本番用）

- [ ] **LINE OAuth（オプション・本番用）**
  - [ ] LINE Developers で新しいチャネル作成
    - Provider: Books Fan
    - Channel type: LINE Login
  - [ ] Callback URL設定:
    ```
    https://books-fan.vercel.app/api/auth/callback/line
    ```
  - [ ] `LINE_CLIENT_ID`（本番用）
  - [ ] `LINE_CLIENT_SECRET`（本番用）

### API Keys

- [ ] `OPENAI_API_KEY` - OpenAI APIキー
- [ ] `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY` - Google Books API

### Stripe（決済機能）

- [ ] `STRIPE_SECRET_KEY` - Secret key (sk_live_...)
- [ ] `STRIPE_PUBLISHABLE_KEY` - Publishable key (pk_live_...)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - 同上
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

### その他

- [ ] `NEXT_PUBLIC_APP_URL` - アプリケーションURL

## 🚀 Vercelデプロイ

### GitHubプッシュ

- [ ] GitHubにリポジトリ作成
- [ ] コードをプッシュ
  ```bash
  git push -u origin main
  ```

### Vercelセットアップ

- [ ] Vercelにログイン（https://vercel.com）
- [ ] 新規プロジェクト作成（Add New → Project）
- [ ] GitHubリポジトリを選択: `okapee/Books-Fan`
- [ ] フレームワーク設定: Next.js（自動検出）
- [ ] **環境変数をすべて追加**（重要！）
  - Settings → Environment Variables
  - `.env.production` の内容を1つずつコピー&ペースト
  - Environment: **Production** を選択
  - **💡 ここで設定した値が本番環境で使用されます**
  - **✅ GitHubには保存されません（安全）**
  - 合計10個以上の環境変数を設定
- [ ] Deploy をクリック（初回デプロイ開始）

### デプロイ後

- [ ] ビルド成功を確認
- [ ] デプロイURLを取得
- [ ] `NEXTAUTH_URL` を実際のURLに更新
- [ ] 再デプロイ

## 💾 データベースマイグレーション

ローカルから実行:

```bash
# 環境変数を設定
export DATABASE_URL="postgresql://..."

# マイグレーション実行
npx prisma migrate deploy

# Prisma Client 生成
npx prisma generate
```

- [ ] マイグレーション成功を確認
- [ ] Prisma Studioでデータベース確認
  ```bash
  npx prisma studio
  ```

## ⚙️ 外部サービス設定

### Google OAuth（本番用の設定確認）

- [ ] Google Cloud Console（https://console.cloud.google.com）
  - [ ] 本番用OAuth 2.0クライアントIDが作成済みか確認
  - [ ] リダイレクトURIが正しいか確認:
    ```
    https://books-fan.vercel.app/api/auth/callback/google
    ```
  - [ ] OAuth同意画面が公開されているか確認

### LINE OAuth（本番用の設定確認・オプション）

- [ ] LINE Developers Console
  - [ ] 本番用チャネルが作成済みか確認
  - [ ] Callback URLが正しいか確認:
    ```
    https://books-fan.vercel.app/api/auth/callback/line
    ```

### Stripe Webhook

- [ ] Stripeダッシュボード
  - [ ] Webhookエンドポイント追加:
    ```
    https://your-domain.com/api/webhooks/stripe
    ```
  - [ ] イベント選択:
    - `checkout.session.completed`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
  - [ ] Signing secret を取得

## ✅ 動作確認

### 基本機能

- [ ] トップページ表示
- [ ] ユーザー登録
- [ ] ログイン（Google OAuth）
- [ ] ログイン（LINE OAuth）
- [ ] ログアウト
- [ ] プロフィール編集

### コア機能

- [ ] 本の検索
- [ ] 本の詳細表示
- [ ] レビュー投稿
- [ ] レビュー編集
- [ ] レビュー削除
- [ ] お気に入り登録
- [ ] ユーザーフォロー

### プレミアム機能

- [ ] AI要約生成
- [ ] マインドマップ生成
- [ ] マインドマップダウンロード（PNG/SVG）
- [ ] SNS共有（X, Facebook, LINE）

### 決済機能

- [ ] プレミアムトライアル開始
- [ ] Stripe Checkout
- [ ] サブスクリプション管理
- [ ] Webhook受信

## 🔒 セキュリティチェック

**環境変数の安全性確認:**
- [ ] `.env` ファイルがGitにコミットされていない
  ```bash
  # 確認コマンド
  git ls-files | grep "\.env"
  # 結果: .env.example のみ表示されればOK
  ```
- [ ] `.gitignore` に以下が含まれている:
  - `.env`
  - `.env*.local`
  - `.env.production`
  - `.env.development`
  - `*.env`

**認証情報の確認:**
- [ ] 本番環境の `NEXTAUTH_SECRET` が開発環境と**異なる**（新しく生成）
- [ ] Google OAuth が本番用（開発環境とは**別のクライアントID**）
- [ ] LINE OAuth が本番用（開発環境とは**別のチャネル**）
- [ ] Stripe APIキーが本番用（`sk_live_...`, `pk_live_...`）
- [ ] OpenAI APIキーが本番用（開発環境と同じでOK）

**データベース:**
- [ ] Neon データベースパスワードが強力（自動生成されたもの）
- [ ] OAuth リダイレクトURIが本番URL

**管理方法:**
- [ ] すべての環境変数がVercelダッシュボードに設定済み
- [ ] `.env.production` がローカルのみに存在
- [ ] パスワード管理ツール（1Password等）に重要な情報を保存済み

## 📊 パフォーマンスチェック

- [ ] Google PageSpeed Insights でスコア確認
- [ ] Lighthouse でスコア確認
- [ ] モバイル表示確認
- [ ] 画像最適化確認
- [ ] ページ読み込み速度確認

## 🎯 オプション設定

### カスタムドメイン

- [ ] Vercel でドメイン追加
- [ ] DNS設定
- [ ] SSL証明書確認

### モニタリング

- [ ] Vercel Analytics 有効化
- [ ] エラーログ確認設定
- [ ] Uptime monitoring 設定

### バックアップ

- [ ] データベース自動バックアップ確認
- [ ] 手動バックアップ方法確認

## 📝 デプロイ後タスク

- [ ] チームメンバーに本番URL共有
- [ ] ドキュメント更新
- [ ] ユーザーテスト実施
- [ ] フィードバック収集準備
- [ ] アナリティクス設定
- [ ] SEO最適化
- [ ] ソーシャルメディアで告知

## 🚨 トラブルシューティング

問題が発生した場合:

1. Vercel のデプロイログを確認
2. ブラウザのコンソールでエラー確認
3. データベース接続を確認
4. 環境変数が正しく設定されているか確認
5. `docs/DEPLOYMENT.md` のトラブルシューティングセクション参照

## 📞 サポート

- Vercel: https://vercel.com/support
- Neon: https://neon.tech/docs
- Stripe: https://support.stripe.com/
- OpenAI: https://help.openai.com/

---

**デプロイ完了おめでとうございます！** 🎉

次のステップ:
- ユーザーフィードバック収集
- 継続的な改善
- 新機能の追加
