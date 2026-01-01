# テストスクリプト

## 概要

開発環境で法人プランや各種プランを無料でテストするためのスクリプト集です。

---

## クイックスタート

### 1. ユーザーステータスを確認

```bash
npm run test:check your-email@example.com
```

現在のユーザー情報、プラン、読書記録などを表示します。

### 2. 法人プランに変更

```bash
npm run test:corporate your-email@example.com
```

以下が自動で実行されます:
- テスト企業（テスト株式会社）の作成
- ユーザーを法人プランに変更
- 企業とユーザーを紐付け

### 3. FREEプランに戻す

```bash
npm run test:reset your-email@example.com
```

または、PREMIUMプランに変更:

```bash
npm run test:reset your-email@example.com PREMIUM
```

---

## 詳細な使い方

### check-user-status.js

ユーザーの現在の状態を確認します（変更なし）。

```bash
node scripts/check-user-status.js user@example.com
```

**表示される情報:**
- ユーザー基本情報（ID、メール、名前など）
- プラン情報（FREE/PREMIUM/CORPORATE）
- 企業情報（法人プランの場合）
- 読書記録（最新5件）
- 読書セッション（最新5件）
- 利用可能なテストコマンド

### setup-corporate-test.js

ユーザーを法人プランに変更します。

```bash
node scripts/setup-corporate-test.js user@example.com
```

**実行内容:**
1. ユーザーの存在確認
2. テスト企業の作成（初回のみ）
   - 企業名: テスト株式会社
   - スラッグ: test-company
   - サブスク状態: ACTIVE（支払いスキップ）
3. ユーザーを法人プランに変更
4. 企業とユーザーを紐付け

**複数ユーザーを法人プランに:**
```bash
node scripts/setup-corporate-test.js user1@example.com
node scripts/setup-corporate-test.js user2@example.com
node scripts/setup-corporate-test.js user3@example.com
```

すべて同じ「テスト株式会社」に所属します。

### reset-corporate-test.js

ユーザーをFREEまたはPREMIUMプランに戻します。

```bash
# FREEプランに戻す（デフォルト）
node scripts/reset-corporate-test.js user@example.com

# PREMIUMプランに変更
node scripts/reset-corporate-test.js user@example.com PREMIUM
```

**実行内容:**
1. ユーザーの現在の状態確認
2. 指定したプランに変更
3. 企業との紐付けを解除

---

## テストシナリオ

### シナリオ1: 基本的な法人機能のテスト

```bash
# 1. 現在の状態を確認
npm run test:check your@email.com

# 2. 法人プランに変更
npm run test:corporate your@email.com

# 3. ブラウザをリフレッシュして以下を確認:
#    - ヘッダーに「CORPORATE」バッジ表示
#    - /company/dashboard にアクセス可能
#    - 企業メンバー一覧が表示される

# 4. 元に戻す
npm run test:reset your@email.com
```

### シナリオ2: 読書記録機能のクロスプランテスト

```bash
# FREEプランでテスト
npm run test:reset your@email.com FREE
# → /reading でポモドーロタイマーを使用
# → 読書セッションを記録
# → レビューを作成

# PREMIUMプランでテスト
npm run test:reset your@email.com PREMIUM
# → 同じ機能が使えることを確認
# → 読書記録が保持されていることを確認

# 法人プランでテスト
npm run test:corporate your@email.com
# → 同じ機能が使えることを確認
# → 企業ダッシュボードで読書統計が見れることを確認

# 最終確認
npm run test:check your@email.com
# → 読書記録がすべて保持されていることを確認
```

### シナリオ3: 複数ユーザーでの法人機能テスト

```bash
# ユーザー1を法人管理者に
npm run test:corporate admin@example.com

# ユーザー2,3を法人メンバーに
npm run test:corporate member1@example.com
npm run test:corporate member2@example.com

# ブラウザで確認:
# - 各ユーザーでログイン
# - /company/dashboard で他のメンバーが見えることを確認
# - /company/feed で全メンバーの活動が表示されることを確認
```

---

## トラブルシューティング

### ユーザーが見つからない

```
❌ ユーザーが見つかりません: user@example.com
```

**対処法:**
1. アプリケーションにログインしてユーザーを作成
2. 正しいメールアドレスを使用しているか確認
3. Prisma Studioで確認: `npm run db:studio`

### 変更が反映されない

**対処法:**
1. ブラウザでログアウト→再ログイン
2. ブラウザのキャッシュをクリア
3. 開発サーバーを再起動: `npm run dev`

### データベースエラー

```
❌ エラーが発生しました: ...
```

**対処法:**
1. Prismaクライアントを再生成: `npm run db:generate`
2. データベース接続を確認: `.env` の `DATABASE_URL`
3. マイグレーションを確認: `npm run db:push`

---

## 注意事項

### 開発環境でのみ使用

これらのスクリプトは開発環境でのみ使用してください。

本番環境では:
- Stripeを通じた正規の支払いフローを使用
- 手動でのデータベース操作は行わない
- テストデータを作成しない

### データの永続性

スクリプトで変更したデータは、データベースに永続的に保存されます。

不要になったテストデータは削除してください:
```bash
npm run db:studio
# Company, ReadingStatus, ReadingSession など削除
```

### 読書記録の保持

プラン変更しても読書記録は保持されます:
- ReadingStatus（読書ステータス）
- ReadingSession（読書セッション）
- Review（レビュー）

ユーザー削除時にカスケード削除されます。

---

## その他のヘルパースクリプト

必要に応じて以下のようなスクリプトも作成できます:

```javascript
// scripts/bulk-import-books.js
// scripts/generate-test-reviews.js
// scripts/create-test-company.js
// scripts/cleanup-test-data.js
```

---

## 関連ドキュメント

- [法人プランテストガイド](../docs/CORPORATE_TESTING_GUIDE.md)
- [デプロイメントチェックリスト](../docs/DEPLOYMENT_CHECKLIST.md)
- [Prismaスキーマ](../prisma/schema.prisma)
