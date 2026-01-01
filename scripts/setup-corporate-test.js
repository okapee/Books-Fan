const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function setupCorporateTest() {
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.error("使用方法: node scripts/setup-corporate-test.js <email>");
    console.error("例: node scripts/setup-corporate-test.js user@example.com");
    process.exit(1);
  }

  try {
    // 1. ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error(`❌ ユーザーが見つかりません: ${userEmail}`);
      console.log("\n💡 ヒント: まずアプリケーションにログインしてユーザーを作成してください");
      process.exit(1);
    }

    console.log(`\n📋 現在の状態:`);
    console.log(`   メール: ${user.email}`);
    console.log(`   名前: ${user.name || "未設定"}`);
    console.log(`   プラン: ${user.membershipType}`);
    console.log(`   企業ID: ${user.companyId || "なし"}`);

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
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
        },
      });
      console.log("   ✅ テスト企業を作成しました");
    } else {
      console.log("\n✅ 既存のテスト企業を使用します");
      console.log(`   企業名: ${company.name}`);
      console.log(`   契約状態: ${company.subscriptionStatus}`);
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

    console.log("\n🎉 完了!");
    console.log(`\n📊 更新後の状態:`);
    console.log(`   メール: ${updatedUser.email}`);
    console.log(`   プラン: ${updatedUser.membershipType}`);
    console.log(`   企業: ${company.name}`);
    console.log(`   企業スラッグ: ${company.slug}`);

    console.log("\n🎯 次のステップ:");
    console.log("   1. ブラウザをリフレッシュしてログアウト→再ログイン");
    console.log("   2. ヘッダーに「CORPORATE」バッジが表示されることを確認");
    console.log("   3. /company/dashboard にアクセスして法人機能を確認");
    console.log("   4. /reading で読書記録機能をテスト");

    console.log("\n📝 元に戻す方法:");
    console.log(`   node scripts/reset-corporate-test.js ${userEmail}`);

    console.log("\n💡 その他のテストユーザーを追加:");
    console.log(`   node scripts/setup-corporate-test.js another-user@example.com`);
  } catch (error) {
    console.error("\n❌ エラーが発生しました:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCorporateTest();
