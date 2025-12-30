# Books Fan デプロイチェックリスト

本番環境へのデプロイ時に使用するチェックリストです。

## 📋 デプロイ前チェック

### 環境準備

- [ ] GitHubアカウント作成済み
- [ ] Vercelアカウント作成済み
- [ ] PostgreSQLデータベース準備完了
  - [ ] Supabase / Neon / Railway のいずれか
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

### Supabase（推奨）

- [ ] Supabase プロジェクト作成
  - Project Name: `books-fan`
  - Region: `Northeast Asia (Tokyo)`
- [ ] データベースパスワード設定（安全な場所に保存）
- [ ] 接続文字列を取得
  - Settings → Database → Connection string (URI)
- [ ] `DATABASE_URL` と `DIRECT_URL` を記録

## 🔑 環境変数設定

`.env.production` を作成し、以下を設定：

### 必須項目

- [ ] `DATABASE_URL` - データベース接続文字列
- [ ] `DIRECT_URL` - 直接接続文字列（Supabase）
- [ ] `NEXTAUTH_SECRET` - 生成方法:
  ```bash
  openssl rand -base64 32
  ```
- [ ] `NEXTAUTH_URL` - 本番URL（後で更新可能）

### OAuth設定

- [ ] Google OAuth
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] Google Cloud Console でリダイレクトURI設定
- [ ] LINE OAuth（オプション）
  - [ ] `LINE_CLIENT_ID`
  - [ ] `LINE_CLIENT_SECRET`

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

- [ ] Vercelにログイン
- [ ] 新規プロジェクト作成
- [ ] GitHubリポジトリを選択
- [ ] フレームワーク設定: Next.js
- [ ] 環境変数をすべて追加
  - Environment: Production
- [ ] Deploy をクリック

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

### Google OAuth

- [ ] Google Cloud Console
  - [ ] OAuth 2.0クライアントID作成
  - [ ] リダイレクトURI追加:
    ```
    https://your-domain.com/api/auth/callback/google
    ```
  - [ ] OAuth同意画面を設定

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

- [ ] `.env` ファイルがGitにコミットされていない
- [ ] `.gitignore` に `.env*` が含まれている
- [ ] 本番環境の `NEXTAUTH_SECRET` が開発環境と異なる
- [ ] Stripe APIキーが本番用（`sk_live_...`）
- [ ] データベースパスワードが強力
- [ ] OAuth リダイレクトURIが本番URL
- [ ] すべてのAPIキーが安全に管理されている

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
- Supabase: https://supabase.com/support
- Stripe: https://support.stripe.com/

---

**デプロイ完了おめでとうございます！** 🎉

次のステップ:
- ユーザーフィードバック収集
- 継続的な改善
- 新機能の追加
