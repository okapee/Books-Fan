/**
 * Followテーブルのデータ整合性を確認するスクリプト
 * 存在しないユーザーへの参照（孤立したレコード）がないかチェック
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyFollowIntegrity() {
  console.log("Followテーブルのデータ整合性をチェックしています...\n");

  // すべてのFollow関係を取得
  const follows = await prisma.follow.findMany({
    select: {
      id: true,
      followerId: true,
      followingId: true,
    },
  });

  console.log(`${follows.length}件のFollow関係を確認します...\n`);

  let orphanedFollowerCount = 0;
  let orphanedFollowingCount = 0;
  const orphanedRecords: string[] = [];

  for (const follow of follows) {
    // followerが存在するか確認
    const followerExists = await prisma.user.findUnique({
      where: { id: follow.followerId },
      select: { id: true },
    });

    // followingが存在するか確認
    const followingExists = await prisma.user.findUnique({
      where: { id: follow.followingId },
      select: { id: true },
    });

    if (!followerExists) {
      orphanedFollowerCount++;
      orphanedRecords.push(
        `✗ Follow ID: ${follow.id} - follower (${follow.followerId}) が存在しません`
      );
    }

    if (!followingExists) {
      orphanedFollowingCount++;
      orphanedRecords.push(
        `✗ Follow ID: ${follow.id} - following (${follow.followingId}) が存在しません`
      );
    }
  }

  console.log("=== チェック結果 ===\n");

  if (orphanedRecords.length === 0) {
    console.log("✓ すべてのFollow関係が正常です。不整合は見つかりませんでした。");
  } else {
    console.log("不整合が見つかりました:\n");
    orphanedRecords.forEach((record) => console.log(record));
    console.log(`\n孤立したfollower参照: ${orphanedFollowerCount}件`);
    console.log(`孤立したfollowing参照: ${orphanedFollowingCount}件`);
    console.log(`合計: ${orphanedRecords.length}件の不整合\n`);

    // 孤立したレコードを削除するか確認
    console.log("これらの孤立したレコードは削除する必要があります。");
    console.log(
      "削除するには、以下のコマンドを実行してください:\nnode scripts/clean-orphaned-follows.ts"
    );
  }

  // ユーザーごとのフォロワー数とフォロー数を表示
  console.log("\n=== ユーザー別統計 ===\n");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  for (const user of users) {
    const followerCount = await prisma.follow.count({
      where: { followingId: user.id },
    });

    const followingCount = await prisma.follow.count({
      where: { followerId: user.id },
    });

    if (followerCount > 0 || followingCount > 0) {
      console.log(
        `${user.name || user.email}: フォロワー ${followerCount}人、フォロー中 ${followingCount}人`
      );
    }
  }
}

verifyFollowIntegrity()
  .catch((error) => {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
