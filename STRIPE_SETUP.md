# Stripe決済統合 セットアップガイド

このガイドでは、Books FanアプリにStripe決済機能を設定する手順を説明します。

## 1. Stripeアカウントの作成

1. [Stripe公式サイト](https://stripe.com/jp)にアクセス
2. 「今すぐ始める」をクリックしてアカウント作成
3. メールアドレスとパスワードを設定

## 2. APIキーの取得

### テストモードのAPIキー

1. Stripeダッシュボードにログイン
2. 左上のトグルで「テストモード」がONになっていることを確認
3. 「開発者」→「APIキー」に移動
4. 以下のキーをコピー:
   - **公開可能キー** (pk_test_xxx)
   - **シークレットキー** (sk_test_xxx)

### .envファイルに追加

```bash
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxx"
```

## 3. 商品と価格の作成

### プレミアムプランの設定

1. Stripeダッシュボードで「商品カタログ」→「商品」に移動
2. 「商品を追加」をクリック
3. 商品情報を入力:
   - **商品名**: Books Fan プレミアムプラン
   - **説明**: AI要約機能付きプレミアム会員プラン
4. 「価格情報を追加」をクリック:
   - **料金モデル**: 標準の料金設定
   - **価格**: 980 JPY
   - **請求期間**: 月次
5. 「商品を保存」をクリック
6. 作成された価格IDをコピー (price_xxxxxxxxxxxxx)

### .envファイルに追加

```bash
STRIPE_PREMIUM_PRICE_ID="price_xxxxxxxxxxxxx"
```

## 4. Webhookの設定

### ローカル開発環境の場合

1. Stripe CLIをインストール:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Stripe CLIでログイン:
   ```bash
   stripe login
   ```

3. Webhookイベントをローカルに転送:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. 表示されたWebhook署名シークレット (whsec_xxx) をコピー

5. .envファイルに追加:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
   ```

### 本番環境の場合

1. Stripeダッシュボードで「開発者」→「Webhook」に移動
2. 「エンドポイントを追加」をクリック
3. エンドポイントURL: `https://yourdomain.com/api/stripe/webhook`
4. 以下のイベントを選択:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Webhook署名シークレットをコピーして.envに追加

## 5. 動作確認

### テストカード情報

Stripeのテストモードでは以下のカード情報を使用できます:

**成功パターン**:
- カード番号: `4242 4242 4242 4242`
- 有効期限: 任意の未来の日付 (例: 12/34)
- CVC: 任意の3桁 (例: 123)
- 郵便番号: 任意

**その他のテストカード**:
- 支払い失敗: `4000 0000 0000 0002`
- 3Dセキュア認証: `4000 0027 6000 3184`

### テスト手順

1. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

2. 別のターミナルでStripe Webhookリスナーを起動:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. ブラウザで `http://localhost:3000` にアクセス

4. Googleでログイン

5. 「プレミアムにアップグレード」ページに移動

6. 「今すぐアップグレード」ボタンをクリック

7. Stripe Checkoutページでテストカード情報を入力

8. 決済完了後、ダッシュボードに戻ることを確認

9. プロフィールページでプレミアムバッジが表示されることを確認

## 6. 顧客ポータルの有効化

1. Stripeダッシュボードで「設定」→「請求」→「顧客ポータル」に移動
2. 「顧客ポータルを有効にする」をクリック
3. 設定を確認して保存

これで、プレミアムユーザーが「設定/請求管理」ページからサブスクリプションを管理できるようになります。

## 7. 本番環境への移行

本番環境で使用する場合:

1. Stripeダッシュボードで「本番モード」に切り替え
2. 本番環境のAPIキーを取得
3. 本番環境の商品と価格を作成
4. 本番環境のWebhookエンドポイントを設定
5. .envファイルを本番環境用の値に更新

## トラブルシューティング

### Webhookが受信されない

- Stripe CLIが起動しているか確認
- エンドポイントURL が正しいか確認
- Webhook署名シークレットが正しいか確認

### 決済が完了してもプレミアムにならない

- サーバーログでWebhookイベントが処理されているか確認
- データベースのユーザーレコードが更新されているか確認
- ブラウザをリロードしてセッションを更新

### エラー: "STRIPE_SECRET_KEY is not defined"

- .envファイルにStripe環境変数が設定されているか確認
- 開発サーバーを再起動

## 参考リンク

- [Stripe公式ドキュメント](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Billing](https://stripe.com/docs/billing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
