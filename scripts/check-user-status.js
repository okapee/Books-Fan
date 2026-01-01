const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkUserStatus() {
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.error("使用方法: node scripts/check-user-status.js <email>");
    console.error("例: node scripts/check-user-status.js user@example.com");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        company: true,
        readingStatuses: {
          include: {
            book: true,
          },
          take: 5,
          orderBy: {
            updatedAt: "desc",
          },
        },
        readingSessions: {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      console.error(`❌ ユーザーが見つかりません: ${userEmail}`);
      process.exit(1);
    }

    console.log("\n" + "=".repeat(60));
    console.log("👤 ユーザー情報");
    console.log("=".repeat(60));
    console.log(`メール: ${user.email}`);
    console.log(`名前: ${user.name || "未設定"}`);
    console.log(`ユーザーID: ${user.id}`);
    console.log(`作成日: ${user.createdAt.toLocaleString("ja-JP")}`);

    console.log("\n" + "=".repeat(60));
    console.log("💳 プラン情報");
    console.log("=".repeat(60));
    console.log(`プラン: ${user.membershipType}`);

    if (user.membershipType === "PREMIUM") {
      console.log(`Stripe顧客ID: ${user.stripeCustomerId || "なし"}`);
      console.log(`サブスク状態: ${user.subscriptionStatus}`);
      if (user.currentPeriodEnd) {
        console.log(`有効期限: ${user.currentPeriodEnd.toLocaleString("ja-JP")}`);
      }
    }

    if (user.company) {
      console.log("\n" + "=".repeat(60));
      console.log("🏢 企業情報");
      console.log("=".repeat(60));
      console.log(`企業名: ${user.company.name}`);
      console.log(`企業スラッグ: ${user.company.slug}`);
      console.log(`ドメイン: ${user.company.domain || "未設定"}`);
      console.log(`プラン: ${user.company.plan}`);
      console.log(`最大ユーザー数: ${user.company.maxUsers}`);
      console.log(`契約タイプ: ${user.company.contractType}`);
      console.log(`サブスク状態: ${user.company.subscriptionStatus}`);
      console.log(`AI使用制限: ${user.company.aiUsageCount}/${user.company.aiUsageLimit}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("📚 読書記録");
    console.log("=".repeat(60));

    if (user.readingStatuses.length > 0) {
      console.log(`登録書籍数: ${user.readingStatuses.length}件（最新5件表示）\n`);
      user.readingStatuses.forEach((status, index) => {
        console.log(`${index + 1}. ${status.book.title}`);
        console.log(`   ステータス: ${status.status}`);
        console.log(`   更新日: ${status.updatedAt.toLocaleString("ja-JP")}`);
      });
    } else {
      console.log("まだ登録されていません");
    }

    console.log("\n" + "=".repeat(60));
    console.log("⏱️ 読書セッション");
    console.log("=".repeat(60));

    if (user.readingSessions.length > 0) {
      const totalDuration = user.readingSessions.reduce(
        (sum, session) => sum + (session.duration || 0),
        0
      );
      const totalHours = Math.floor(totalDuration / 3600);
      const totalMins = Math.floor((totalDuration % 3600) / 60);

      console.log(`セッション数: ${user.readingSessions.length}件（最新5件表示）`);
      console.log(`総読書時間: ${totalHours}時間${totalMins}分\n`);

      user.readingSessions.forEach((session, index) => {
        const mins = Math.floor((session.duration || 0) / 60);
        console.log(`${index + 1}. ${mins}分間 - ${session.createdAt.toLocaleString("ja-JP")}`);
        console.log(`   完了: ${session.isCompleted ? "✅" : "❌"}`);
      });
    } else {
      console.log("まだ記録されていません");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🔧 テストコマンド");
    console.log("=".repeat(60));

    if (user.membershipType === "CORPORATE") {
      console.log(`FREEに戻す: node scripts/reset-corporate-test.js ${userEmail}`);
      console.log(`PREMIUMに変更: node scripts/reset-corporate-test.js ${userEmail} PREMIUM`);
    } else {
      console.log(`法人プランに変更: node scripts/setup-corporate-test.js ${userEmail}`);
      if (user.membershipType === "FREE") {
        console.log(`PREMIUMに変更: node scripts/reset-corporate-test.js ${userEmail} PREMIUM`);
      } else {
        console.log(`FREEに戻す: node scripts/reset-corporate-test.js ${userEmail} FREE`);
      }
    }

    console.log("\n");
  } catch (error) {
    console.error("\n❌ エラーが発生しました:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStatus();
