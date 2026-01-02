# Stripe機能デプロイメントチェックリスト

## 必須環境変数

本番環境で以下の環境変数が正しく設定されているか確認してください：

### Stripe関連
```bash
# Stripe シークレットキー（本番用）
STRIPE_SECRET_KEY=sk_live_...

# Stripe 公開キー（本番用）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# プレミアムプラン価格ID（本番環境のStripeダッシュボードで作成したもの）
STRIPE_PREMIUM_PRICE_ID=price_...

# Webhook署名シークレット（本番環境用）
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Next.js / NextAuth関連
```bash
# アプリケーションのベースURL（本番環境）
NEXTAUTH_URL=https://books-fan.com

# NextAuthのシークレット（ランダムな長い文字列）
NEXTAUTH_SECRET=... # openssl rand -base64 32 で生成
```

## 環境変数の確認方法

### Vercelの場合
1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. Settings → Environment Variables
4. 上記の環境変数がすべて設定されているか確認
5. Production環境に設定されているか確認

### 他のプラットフォームの場合
プラットフォームの管理画面で環境変数を確認・設定してください。

## Stripeダッシュボードでの確認事項

### 1. APIキーの確認
- https://dashboard.stripe.com/apikeys
- 本番モード（Live mode）になっているか確認
- シークレットキー（Secret key）をコピーして環境変数に設定

### 2. 商品と価格の確認
- https://dashboard.stripe.com/products
- 「Books Fan プレミアムプラン」商品が存在するか
- 価格ID（price_...）を環境変数 `STRIPE_PREMIUM_PRICE_ID` に設定

### 3. Webhookの設定
- https://dashboard.stripe.com/webhooks
- エンドポイント: `https://books-fan.com/api/stripe/webhook`
- 以下のイベントを有効化:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- Webhook署名シークレット（whsec_...）を環境変数に設定

### 4. プロモーションコードの確認
- テストモードと本番モードで別々に作成する必要があります
- 本番環境で使用する場合は、本番モードでクーポンとプロモーションコードを作成

## トラブルシューティング

### エラー: "STRIPE_SECRET_KEY is not defined"
**原因**: 環境変数が設定されていない
**解決方法**:
1. 本番環境の環境変数設定を確認
2. `STRIPE_SECRET_KEY` を設定（本番用キーは `sk_live_` で始まる）
3. デプロイを再実行

### エラー: "チェックアウトセッションの作成に失敗しました"
**原因**:
- Stripe APIキーが無効
- 価格ID（STRIPE_PREMIUM_PRICE_ID）が間違っている
- ネットワークエラー

**解決方法**:
1. Stripeダッシュボードでキーが有効か確認
2. 価格IDが正しいか確認（本番環境の価格IDを使用）
3. サーバーログを確認して詳細なエラーメッセージを取得

### エラー: "Mixed Content"
**原因**: HTTPとHTTPSが混在している
**解決方法**:
1. `NEXTAUTH_URL` が `https://` で始まっているか確認
2. すべての外部APIリクエストがHTTPSを使用しているか確認

### プロモーションコードが適用されない
**原因**:
- テストモードと本番モードでコードが異なる
- コードの大文字小文字が間違っている（Stripeは大文字小文字を区別）
- コードの有効期限切れ
- 使用回数上限に達している

**解決方法**:
1. 本番モードでプロモーションコードが作成されているか確認
2. コードを正確に入力（大文字小文字も一致させる）
3. Stripeダッシュボードでコードの状態を確認

## デプロイ手順

1. ✅ Stripeダッシュボードで本番モードの商品・価格を作成
2. ✅ Stripeダッシュボードで本番モードのプロモーションコードを作成
3. ✅ Webhookを設定
4. ✅ 環境変数をすべて設定
5. ✅ コードをデプロイ
6. ✅ 本番環境でテスト（テストカードは使えないので注意）

## テスト方法

### テスト環境
- テストモード用のAPIキー（sk_test_...）を使用
- テスト用プロモーションコードを作成
- Stripeのテストカード番号を使用:
  - 成功: `4242 4242 4242 4242`
  - 失敗: `4000 0000 0000 0002`

### 本番環境
- ⚠️ 本番環境では実際の決済が発生します
- 小額でテストするか、テスト後すぐにキャンセル
- または信頼できるテストユーザーで確認

## セキュリティ注意事項

- ✅ 公開キー（pk_...）のみをクライアント側で使用
- ❌ シークレットキー（sk_...）をクライアント側に含めない
- ❌ シークレットキーをGitにコミットしない
- ✅ Webhook署名を必ず検証（セキュリティのため）

## 参考リンク

- [Stripe APIドキュメント](https://stripe.com/docs/api)
- [Stripe Checkoutドキュメント](https://stripe.com/docs/payments/checkout)
- [Stripe Webhookガイド](https://stripe.com/docs/webhooks)
- [Stripe テストカード](https://stripe.com/docs/testing)
