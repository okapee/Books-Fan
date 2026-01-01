# 法人プランテストガイド

## 概要
法人プラン機能を無料でテストする方法を説明します。開発環境で30,000円の支払いなしにテスト可能です。

---

## 方法1: データベース直接操作（最も簡単）

### ステップ1: 現在のユーザーIDを確認

開発サーバーを起動してログイン後、ブラウザのコンソールで以下を実行:

```javascript
// セッション情報を確認
console.log(window.localStorage);
```

または、データベースで直接確認:

```bash
npx prisma studio
```

Prisma Studioが開いたら、`User`テーブルで自分のメールアドレスを探してIDをコピー。

### ステップ2: データベースでユーザーを法人プランに変更

以下のSQLをPrisma Studioまたはデータベースクライアントで実行:

```sql
-- 自分のユーザーを法人プランに変更
UPDATE "User"
SET "membershipType" = 'CORPORATE'
WHERE email = 'your-email@example.com';
```

### ステップ3: ページをリフレッシュ

ブラウザをリフレッシュすると、法人プランユーザーとしてログインされます。

---

## 方法2: テストスクリプトを使用（推奨）

開発用のテストスクリプトを作成します。

### `/scripts/setup-corporate-test.js` を作成

```javascript
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function setupCorporateTest() {
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.error("使用方法: node scripts/setup-corporate-test.js <email>");
    process.exit(1);
  }

  try {
    // 1. ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error(`ユーザーが見つかりません: ${userEmail}`);
      process.exit(1);
    }

    console.log(`\n📋 現在の状態:`);
    console.log(`メール: ${user.email}`);
    console.log(`プラン: ${user.membershipType}`);
    console.log(`企業ID: ${user.companyId || "なし"}`);

    // 2. テスト企業を作成または取得
    let company = await prisma.company.findFirst({
      where: { slug: "test-company" },
    });

    if (!company) {
      console.log("\n🏢 テスト企業を作成中...");
      company = await prisma.company.create({
        data: {
          name: "テスト株式会社",
          slug: "test-company",
          domain: "test-company.com",
          plan: "CORPORATE",
          maxUsers: 100,
          contractType: "MONTHLY",
          subscriptionStatus: "ACTIVE", // 支払いスキップ
          aiUsageLimit: 1000,
          aiUsageCount: 0,
        },
      });
      console.log("✅ テスト企業を作成しました");
    } else {
      console.log("\n✅ 既存のテスト企業を使用します");
    }

    // 3. ユーザーを法人プランに変更
    console.log("\n👤 ユーザーを法人プランに変更中...");
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        membershipType: "CORPORATE",
        companyId: company.id,
      },
    });

    console.log("\n✅ 完了!");
    console.log(`\n📊 更新後の状態:`);
    console.log(`メール: ${updatedUser.email}`);
    console.log(`プラン: ${updatedUser.membershipType}`);
    console.log(`企業: ${company.name}`);
    console.log(`企業ID: ${company.id}`);

    console.log("\n🎯 次のステップ:");
    console.log("1. ブラウザをリフレッシュ");
    console.log("2. /company/dashboard にアクセスして法人機能を確認");
    console.log("\n📝 元に戻す方法:");
    console.log(`   node scripts/reset-corporate-test.js ${userEmail}`);
  } catch (error) {
    console.error("エラー:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCorporateTest();
```

### `/scripts/reset-corporate-test.js` を作成

```javascript
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function resetCorporateTest() {
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.error("使用方法: node scripts/reset-corporate-test.js <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error(`ユーザーが見つかりません: ${userEmail}`);
      process.exit(1);
    }

    console.log(`\n📋 現在の状態:`);
    console.log(`プラン: ${user.membershipType}`);

    // FREEプランに戻す
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        membershipType: "FREE",
        companyId: null,
      },
    });

    console.log("\n✅ FREEプランに戻しました");
    console.log(`プラン: ${updatedUser.membershipType}`);
    console.log("\n🎯 ブラウザをリフレッシュしてください");
  } catch (error) {
    console.error("エラー:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCorporateTest();
```

### 使用方法

```bash
# 法人プランに変更
node scripts/setup-corporate-test.js your-email@example.com

# FREEプランに戻す
node scripts/reset-corporate-test.js your-email@example.com
```

---

## 方法3: 企業招待フローを使用

実際の招待フローをテストする場合:

### ステップ1: テスト企業を手動作成

Prisma Studioで `Company` テーブルに新規レコード追加:

```
name: "テスト株式会社"
slug: "test-company-2024"
domain: "testcompany.com"
plan: "CORPORATE"
maxUsers: 100
subscriptionStatus: "ACTIVE"  // 支払いスキップ
```

### ステップ2: 管理者ユーザーを設定

`User` テーブルで自分のユーザーレコードを更新:

```
membershipType: "CORPORATE"
companyId: <上で作成した企業のID>
```

### ステップ3: 招待機能をテスト

1. `/company/dashboard` にアクセス
2. 「メンバーを招待」で別のメールアドレスを招待
3. 招待メールのリンクをコピー
4. 別のブラウザまたはシークレットウィンドウで招待リンクを開く

---

## テストチェックリスト

法人プランで以下の機能が動作することを確認:

### 基本機能
- [ ] ログイン/ログアウト
- [ ] プロフィール表示・編集
- [ ] 本の検索・閲覧

### 読書記録機能（新規実装）
- [ ] 読書ステータス設定（読みたい/読書中/読了）
- [ ] `/reading` ページへのアクセス
- [ ] ポモドーロタイマーの使用
- [ ] 読書セッション記録の保存
- [ ] 読書統計の表示
- [ ] 読了後のレビュー作成

### レビュー機能
- [ ] レビュー作成・編集・削除
- [ ] レビューへの「いいね」
- [ ] コメント投稿

### ソーシャル機能
- [ ] ユーザーフォロー
- [ ] フォローユーザーの読書記録閲覧
- [ ] アクティビティフィード表示

### 法人専用機能
- [ ] `/company/dashboard` アクセス
- [ ] 企業メンバー一覧表示
- [ ] メンバー招待機能
- [ ] 企業レポート閲覧
- [ ] 企業フィード閲覧

### プレミアム機能（法人プランはプレミアム権限を含む）
- [ ] マインドマップ機能
- [ ] AI推薦機能
- [ ] 高度な統計表示

---

## トラブルシューティング

### セッションがリフレッシュされない

```bash
# Next.jsキャッシュをクリア
rm -rf .next
npm run dev
```

### データベース変更が反映されない

```bash
# Prismaクライアント再生成
npx prisma generate

# 開発サーバー再起動
npm run dev
```

### 法人ダッシュボードにアクセスできない

`middleware.ts` で法人プラン判定を確認:

```typescript
// middleware.tsまたは該当ページで
const isCorporate = session?.user?.membershipType === "CORPORATE";
```

---

## 本番環境への影響

これらのテスト方法は開発環境でのみ使用してください。

本番環境では:
- Stripe連携を通じた正規の支払いフローを使用
- `subscriptionStatus` は Webhook で自動更新
- テストデータは作成しない

---

## 参考ファイル

- データベーススキーマ: `prisma/schema.prisma`
- 法人API: `server/trpc/routers/company.ts`
- 法人ダッシュボード: `app/company/dashboard/page.tsx`
- Stripe Webhook: `app/api/stripe/webhook/route.ts`
- 企業招待: `app/api/webhooks/stripe-corporate/route.ts`
