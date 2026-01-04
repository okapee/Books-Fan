/**
 * 既存の本のレビュー数と平均評価を再計算して修正するスクリプト
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixBookCounts() {
  console.log("本のレビュー数と平均評価を再計算しています...");

  // すべての本を取得
  const books = await prisma.book.findMany({
    select: { id: true, title: true, reviewCount: true, averageRating: true },
  });

  console.log(`${books.length}冊の本を処理します...`);

  let fixedCount = 0;
  let unchangedCount = 0;

  for (const book of books) {
    // 実際のレビュー数と平均評価を計算
    const avgRating = await prisma.review.aggregate({
      where: { bookId: book.id },
      _avg: { rating: true },
      _count: true,
    });

    const actualReviewCount = avgRating._count;
    const actualAverageRating = avgRating._avg.rating || 0;

    // 不整合がある場合のみ更新
    if (
      book.reviewCount !== actualReviewCount ||
      Math.abs(book.averageRating! - actualAverageRating) > 0.01
    ) {
      await prisma.book.update({
        where: { id: book.id },
        data: {
          reviewCount: actualReviewCount,
          averageRating: actualAverageRating,
        },
      });

      console.log(
        `✓ 修正: "${book.title}" - レビュー数: ${book.reviewCount} → ${actualReviewCount}, 平均評価: ${book.averageRating?.toFixed(1)} → ${actualAverageRating.toFixed(1)}`
      );
      fixedCount++;
    } else {
      unchangedCount++;
    }
  }

  console.log("\n=== 完了 ===");
  console.log(`修正した本: ${fixedCount}冊`);
  console.log(`変更なし: ${unchangedCount}冊`);
  console.log(`合計: ${books.length}冊`);
}

fixBookCounts()
  .catch((error) => {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
