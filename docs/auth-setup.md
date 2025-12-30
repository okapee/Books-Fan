# 認証機能のセットアップガイド

Books Fanの認証機能（NextAuth.js + Google OAuth）が実装されました！

## ✅ 実装済みの機能

### 1. NextAuth.js設定
- ✅ Google OAuth Provider
- ✅ Prisma Adapter（データベース連携）
- ✅ セッション管理（データベースベース）
- ✅ カスタムコールバック（会員情報の追加）

### 2. UI コンポーネント
- ✅ ヘッダー（ログイン/ログアウトボタン）
- ✅ フッター
- ✅ プロフィールページ（会員情報、AI使用状況、最近のレビュー）

### 3. セキュリティ
- ✅ ミドルウェアによる保護されたルート
  - `/profile/*`
  - `/dashboard/*`
  - `/settings/*`

---

## 🚀 セットアップ手順

### 1. Google OAuth の設定

#### Google Cloud Console でプロジェクトを作成

1. https://console.cloud.google.com/ にアクセス
2. 新しいプロジェクトを作成
   - プロジェクト名: `books-fan`

#### OAuth 同意画面の設定

1. 左メニュー「APIとサービス」→「OAuth同意画面」
2. User Type: **「外部」** を選択して「作成」
3. アプリ情報を入力:
   - アプリ名: `Books Fan`
   - ユーザーサポートメール: あなたのメールアドレス
   - アプリのロゴ: （オプション）
4. スコープ:
   - デフォルトのまま（email、profile、openid）
5. テストユーザー:
   - **必ず自分のGoogleアカウントを追加**
   - 複数追加可能（開発チームメンバーなど）

#### OAuth 2.0 クライアント ID の作成

1. 左メニュー「認証情報」→「認証情報を作成」
2. **「OAuth クライアント ID」** を選択
3. アプリケーションの種類: **「ウェブアプリケーション」**
4. 名前: `Books Fan Web Client`
5. **承認済みのリダイレクト URI** を追加:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   （本番環境では後で追加: `https://your-domain.com/api/auth/callback/google`）
6. 「作成」をクリック
7. **クライアント ID** と **クライアント シークレット** をコピー

### 2. 環境変数の設定

`.env` ファイルを開いて、以下を設定:

```env
# Google OAuth（必須）
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# NextAuth.js（必須）
NEXTAUTH_SECRET="シークレットキー"
NEXTAUTH_URL="http://localhost:3000"
```

#### NEXTAUTH_SECRET の生成

ターミナルで以下を実行:
```bash
openssl rand -base64 32
```

生成されたランダム文字列を `NEXTAUTH_SECRET` に設定してください。

### 3. データベースのセットアップ

Neonでデータベースを作成済みの場合:

```bash
# スキーマをデータベースに適用
npx prisma db push

# Prisma Studio でテーブルを確認（オプション）
npx prisma studio
```

#### Neonのセットアップ（まだの場合）

1. https://neon.tech にアクセス
2. GitHubアカウントでサインアップ
3. 新規プロジェクト作成:
   - プロジェクト名: `books-fan`
   - リージョン: `AWS / Tokyo (ap-northeast-1)`
4. 接続文字列をコピー
5. `.env` に設定:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb"
   ```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

---

## 🎯 動作確認手順

### 1. ログイン機能のテスト

1. トップページ（http://localhost:3000）を開く
2. ヘッダーの「Googleでログイン」ボタンをクリック
3. Google OAuth 画面が表示される
4. テストユーザーとして登録したアカウントでログイン
5. 初回ログイン時、Books Fanへのアクセス許可を求められる → 「許可」
6. トップページにリダイレクトされる
7. ヘッダーに自分のアイコンと名前が表示される

### 2. プロフィールページ

1. ヘッダーの自分の名前またはアイコンをクリック
2. プロフィールページ（http://localhost:3000/profile）に移動
3. 以下が表示される:
   - プロフィール画像
   - 名前、メールアドレス
   - 会員プラン（無料）
   - AI使用状況（無料会員は0/0）
   - 統計（レビュー数、AI要点数、お気に入り数）

### 3. ログアウト

1. ヘッダーの「ログアウト」ボタンをクリック
2. トップページにリダイレクトされる
3. ヘッダーが「Googleでログイン」ボタンに戻る

### 4. 保護されたルートのテスト

1. ログアウトした状態で http://localhost:3000/profile にアクセス
2. 自動的にトップページにリダイレクトされる（ミドルウェアが動作）

---

## 📊 データベース構造

認証後、以下のテーブルにデータが保存されます:

### User テーブル
- 基本情報（name, email, image）
- 会員タイプ（membershipType: FREE/PREMIUM）
- AI使用状況（aiUsageCount, aiUsageResetDate）

### Account テーブル
- Google OAuth の連携情報
- アクセストークン、リフレッシュトークン

### Session テーブル
- ログインセッション情報
- セッショントークン、有効期限

---

## 🔧 トラブルシューティング

### エラー: `[next-auth][error][OAUTH_CALLBACK_ERROR]`

**原因**: リダイレクトURIが正しく設定されていない

**解決策**:
1. Google Cloud Console の OAuth クライアント設定を確認
2. 承認済みのリダイレクトURIに以下が含まれているか確認:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
3. URLに余分なスペースやスラッシュがないか確認

### エラー: `[next-auth][error][NO_SECRET]`

**原因**: NEXTAUTH_SECRET が設定されていない

**解決策**:
```bash
# シークレットを生成
openssl rand -base64 32

# .env に追加
NEXTAUTH_SECRET="生成されたシークレット"
```

### エラー: `Access blocked: This app's request is invalid`

**原因**: OAuth 同意画面が未設定、またはテストユーザーが登録されていない

**解決策**:
1. Google Cloud Console で OAuth 同意画面を確認
2. テストユーザーにログインしようとしているGoogleアカウントを追加

### データベース接続エラー

**原因**: DATABASE_URL が正しくない、またはNeonプロジェクトがスリープ中

**解決策**:
1. `.env` の DATABASE_URL を確認
2. Neonダッシュボードでプロジェクトが起動しているか確認
3. 再度 `npx prisma db push` を実行

### ログイン後にユーザー情報が表示されない

**原因**: Prisma Client が古い、またはスキーマが適用されていない

**解決策**:
```bash
# Prisma Client を再生成
npx prisma generate

# スキーマを適用
npx prisma db push

# 開発サーバーを再起動
npm run dev
```

---

## 🎨 カスタマイズ

### プロフィール画像のカスタマイズ

`components/layout/Header.tsx` の60-68行目:
```typescript
{session.user.image ? (
  <Image
    src={session.user.image}
    alt={session.user.name || "User"}
    width={32}
    height={32}
    className="rounded-full"
  />
) : (
  // デフォルトアバター
)}
```

### セッションの有効期限変更

`lib/auth.ts` の68行目:
```typescript
session: {
  strategy: "database",
  maxAge: 30 * 24 * 60 * 60, // 30日（変更可能）
},
```

### 追加の OAuth Provider

`lib/auth.ts` に追加:
```typescript
import GitHubProvider from "next-auth/providers/github";

providers: [
  GoogleProvider({ ... }),
  GitHubProvider({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  }),
],
```

---

## 📝 次のステップ

認証機能が動作確認できたら、次の機能を実装できます:

1. **本の検索・表示** (Google Books API連携)
2. **レビュー投稿機能**
3. **AI要点生成** (OpenAI GPT-4o-mini)
4. **Stripe決済** (プレミアムプラン)

どの機能から実装しますか？
