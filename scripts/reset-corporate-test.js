const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function resetCorporateTest() {
  const userEmail = process.argv[2];
  const plan = process.argv[3] || "FREE";

  if (!userEmail) {
    console.error("使用方法: node scripts/reset-corporate-test.js <email> [FREE|PREMIUM]");
    console.error("例: node scripts/reset-corporate-test.js user@example.com FREE");
    process.exit(1);
  }

  if (!["FREE", "PREMIUM"].includes(plan)) {
    console.error("❌ プランはFREEまたはPREMIUMを指定してください");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        company: true,
      },
    });

    if (!user) {
      console.error(`❌ ユーザーが見つかりません: ${userEmail}`);
      process.exit(1);
    }

    console.log(`\n📋 現在の状態:`);
    console.log(`   メール: ${user.email}`);
    console.log(`   プラン: ${user.membershipType}`);
    console.log(`   企業: ${user.company ? user.company.name : "なし"}`);

    // プランを変更
    console.log(`\n🔄 ${plan}プランに変更中...`);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        membershipType: plan,
        companyId: null,
      },
    });

    console.log("\n✅ プラン変更完了!");
    console.log(`\n📊 更新後の状態:`);
    console.log(`   メール: ${updatedUser.email}`);
    console.log(`   プラン: ${updatedUser.membershipType}`);
    console.log(`   企業: なし`);

    console.log("\n🎯 次のステップ:");
    console.log("   1. ブラウザをリフレッシュしてログアウト→再ログイン");
    if (plan === "FREE") {
      console.log("   2. ヘッダーからCORPORATEバッジが消えていることを確認");
      console.log("   3. /company/dashboard にアクセスできないことを確認");
    } else {
      console.log("   2. ヘッダーにPREMIUMバッジが表示されることを確認");
      console.log("   3. プレミアム機能（マインドマップなど）が使えることを確認");
    }

    console.log("\n💡 再度法人プランに戻す:");
    console.log(`   node scripts/setup-corporate-test.js ${userEmail}`);
  } catch (error) {
    console.error("\n❌ エラーが発生しました:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCorporateTest();
