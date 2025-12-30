import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWeeklyBookRecommendations } from "@/lib/line/messaging";

/**
 * 週次おすすめ本配信Cron
 * Vercel Cronから毎週実行される
 */
export async function GET(request: NextRequest) {
  try {
    // CRON_SECRETで認証
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // LINE通知が有効なユーザーを取得
    const users = await prisma.user.findMany({
      where: {
        lineUserId: { not: null },
        lineAccessToken: { not: null },
        lineNotificationsEnabled: true,
      },
      select: {
        id: true,
        name: true,
        reviews: {
          select: {
            book: {
              select: {
                categories: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    const results = {
      total: users.length,
      succeeded: 0,
      failed: 0,
    };

    // 各ユーザーにおすすめ本を送信
    for (const user of users) {
      try {
        // ユーザーの読書履歴からカテゴリを抽出
        const userCategories = new Set<string>();
        user.reviews.forEach((review) => {
          review.book.categories.forEach((cat) => userCategories.add(cat));
        });

        // おすすめ本を取得（ユーザーのカテゴリに基づく）
        const recommendedBooks = await prisma.book.findMany({
          where: {
            categories: {
              hasSome: Array.from(userCategories),
            },
            reviews: {
              none: {
                userId: user.id,
              },
            },
          },
          orderBy: [
            { averageRating: "desc" },
            { reviewCount: "desc" },
          ],
          take: 5,
          select: {
            id: true,
            title: true,
            author: true,
            coverImageUrl: true,
            description: true,
          },
        });

        // カテゴリベースの本がない場合は、人気の本を推薦
        if (recommendedBooks.length === 0) {
          const popularBooks = await prisma.book.findMany({
            where: {
              reviews: {
                none: {
                  userId: user.id,
                },
              },
            },
            orderBy: [
              { averageRating: "desc" },
              { reviewCount: "desc" },
            ],
            take: 5,
            select: {
              id: true,
              title: true,
              author: true,
              coverImageUrl: true,
              description: true,
            },
          });

          if (popularBooks.length > 0) {
            const success = await sendWeeklyBookRecommendations(
              user.id,
              popularBooks
            );
            if (success) {
              results.succeeded++;
            } else {
              results.failed++;
            }
          }
        } else {
          const success = await sendWeeklyBookRecommendations(
            user.id,
            recommendedBooks
          );
          if (success) {
            results.succeeded++;
          } else {
            results.failed++;
          }
        }
      } catch (error) {
        console.error(`Failed to send recommendations to user ${user.id}:`, error);
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Weekly recommendations sent",
      results,
    });
  } catch (error) {
    console.error("Error in weekly recommendations cron:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
