# Books Fan - セットアップガイド

完全無料で始めるための詳細なセットアップ手順です。

## 1. Neon Database のセットアップ（無料）

### 手順

1. **Neonにアクセス**: https://neon.tech
2. **サインアップ**: GitHubアカウントでサインアップ（推奨）
3. **新規プロジェクト作成**:
   - プロジェクト名: `books-fan`
   - リージョン: `AWS / Tokyo (ap-northeast-1)` を選択（日本から近い）
   - PostgreSQLバージョン: 最新版を選択
4. **接続文字列を取得**:
   - ダッシュボードで「Connection Details」をクリック
   - 「Connection string」をコピー
5. **.env ファイルに設定**:
   ```
   DATABASE_URL="postgresql://user:password@ep-xxx-xxx.ap-northeast-1.aws.neon.tech/neondb?sslmode=require"
   ```

### Prisma のセットアップ

```bash
# Prisma Client を生成
npx prisma generate

# データベースにスキーマを適用
npx prisma db push

# 確認（Prisma Studio を起動）
npx prisma studio
```

ブラウザで http://localhost:5555 が開き、データベースのテーブルを確認できます。

---

## 2. Google OAuth のセットアップ（無料）

### 手順

1. **Google Cloud Console にアクセス**: https://console.cloud.google.com/
2. **新規プロジェクト作成**:
   - プロジェクト名: `books-fan`
3. **OAuth 同意画面の設定**:
   - 左メニュー「APIとサービス」→「OAuth同意画面」
   - User Type: 「外部」を選択
   - アプリ名: `Books Fan`
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先情報: あなたのメールアドレス
   - 保存して続行
   - スコープ: デフォルトのまま
   - テストユーザー: あなたのGoogleアカウントを追加（開発中のみ必要）
4. **OAuth 2.0 クライアント ID の作成**:
   - 左メニュー「認証情報」→「認証情報を作成」→「OAuth クライアント ID」
   - アプリケーションの種類: 「ウェブアプリケーション」
   - 名前: `Books Fan Web`
   - 承認済みのリダイレクト URI:
     - 開発: `http://localhost:3000/api/auth/callback/google`
     - 本番: `https://your-domain.com/api/auth/callback/google`（後で追加）
   - 作成
5. **クライアント ID とシークレットをコピー**:
   - `.env` ファイルに設定:
   ```
   GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="xxx"
   ```

---

## 3. NextAuth.js のセットアップ

### シークレットキーの生成

```bash
openssl rand -base64 32
```

`.env` に設定:
```
NEXTAUTH_SECRET="生成されたシークレット"
NEXTAUTH_URL="http://localhost:3000"
```

本番環境では `NEXTAUTH_URL` を実際のドメインに変更してください。

---

## 4. OpenAI API のセットアップ

### 手順

1. **OpenAI Platform にアクセス**: https://platform.openai.com/
2. **サインアップ/ログイン**
3. **API キーを作成**:
   - 右上のアイコン → 「API keys」
   - 「Create new secret key」
   - 名前: `books-fan-dev`
   - キーをコピー（一度しか表示されません！）
4. **.env に設定**:
   ```
   OPENAI_API_KEY="sk-proj-xxx"
   ```

### 使用量の監視設定

1. 「Usage」ページで使用量を確認できます
2. 「Usage limits」で月間上限を設定（例: $10）
3. メール通知を有効化

### コスト計算

- GPT-4o-mini: 入力 $0.15/1M tokens, 出力 $0.60/1M tokens
- 1回の要点生成: 約$0.0003（約¥0.05）
- 月1,000回: 約$0.30（約¥45）

---

## 5. Stripe のセットアップ（テストモード無料）

### 手順

1. **Stripe にアクセス**: https://stripe.com/
2. **サインアップ**（ビジネス情報は後で入力可能）
3. **テストモードに切り替え**:
   - 左上のスイッチで「テストモード」を選択
4. **API キーを取得**:
   - 「開発者」→「APIキー」
   - 公開可能キーとシークレットキーをコピー
5. **.env に設定**:
   ```
   STRIPE_SECRET_KEY="sk_test_xxx"
   STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
   ```

### プレミアムプランの商品作成

1. **商品を作成**:
   - 「商品」→「商品を追加」
   - 名前: `プレミアムプラン`
   - 説明: `月30冊までのAI要点生成が可能`
2. **価格を設定**:
   - 価格: `980 JPY`
   - 請求期間: `月次`
   - 作成後、価格IDをコピー（`price_xxx`）
3. **.env に設定**:
   ```
   STRIPE_PREMIUM_PRICE_ID="price_xxx"
   ```

### Webhook の設定（後で実装時）

開発環境では Stripe CLI を使用:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 6. Google Books API のセットアップ（無料）

### 手順

1. **Google Cloud Console** で OAuth と同じプロジェクトを開く
2. **Books API を有効化**:
   - 「APIとサービス」→「ライブラリ」
   - 「Google Books API」を検索
   - 「有効にする」
3. **API キーを作成**:
   - 「認証情報」→「認証情報を作成」→「APIキー」
   - キーをコピー
4. **キーを制限（推奨）**:
   - 作成されたキーをクリック
   - 「アプリケーションの制限」: HTTPリファラー
   - リファラー: `localhost:3000/*`, `your-domain.com/*`
   - 「APIの制限」: Google Books API のみ
5. **.env に設定**:
   ```
   GOOGLE_BOOKS_API_KEY="AIzaSyXXX"
   ```

### 使用量制限

- 無料枠: 1日1,000リクエスト
- 十分な量です

---

## 7. 開発サーバーの起動

すべての環境変数が設定できたら:

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

---

## トラブルシューティング

### Prisma関連

**エラー**: `Error: P1001: Can't reach database server`
- DATABASE_URL が正しいか確認
- Neonのプロジェクトが起動しているか確認（無料プランは一定期間非アクティブでスリープ）

**エラー**: `prisma command not found`
```bash
npx prisma --version
```
で確認。なければ:
```bash
npm install
```

### NextAuth関連

**エラー**: `[next-auth][error][NO_SECRET]`
- NEXTAUTH_SECRET が設定されているか確認

**エラー**: OAuth エラー
- Google Cloud Console でリダイレクト URI が正しいか確認
- テストユーザーに自分のアカウントが追加されているか確認

### tRPC関連

**エラー**: `fetch failed`
- サーバーが起動しているか確認
- `/api/trpc/[trpc]/route.ts` が存在するか確認

---

## 次のステップ

セットアップが完了したら:

1. ✅ Google アカウントでログインを試す
2. ✅ 本を検索する
3. ✅ レビューを投稿する
4. ✅ AI要点生成を試す
5. ✅ Stripe テストカードで決済を試す

テストカード:
- カード番号: `4242 4242 4242 4242`
- 有効期限: 任意の未来の日付
- CVC: 任意の3桁

---

## コスト見積もり

### 開発中（テスト）
- Neon: ¥0
- Google OAuth: ¥0
- OpenAI: ¥50-100/月（テストで100回程度実行）
- Stripe: ¥0（テストモード）
- Google Books: ¥0
- **合計: ¥50-100/月**

### 本番（10ユーザー）
- Neon: ¥0
- Vercel: ¥0（Hobbyプラン）※商用は¥3,000
- OpenAI: ¥5
- Stripe: 手数料のみ
- **合計: ¥5 + Stripe手数料**

完全に無料で開発・テストできます！
