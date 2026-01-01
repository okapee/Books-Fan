import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const discoveryRouter = router({
  // ============================================
  // ソーシャル発見エンドポイント
  // ============================================

  // フォロー中のユーザーがレビューした本
  getFollowingBooks: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        return { books: [], nextCursor: undefined };
      }

      const userId = ctx.session.user.id;

      // フォロー中のユーザーIDを取得
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      const followingIds = following.map((f) => f.followingId);

      if (followingIds.length === 0) {
        return { books: [], nextCursor: undefined };
      }

      // フォロー中のユーザーのレビューを取得
      const reviews = await prisma.review.findMany({
        where: {
          userId: { in: followingIds },
          isPublic: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          book: {
            include: {
              _count: {
                select: { reviews: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined = undefined;
      if (reviews.length > input.limit) {
        const nextItem = reviews.pop();
        nextCursor = nextItem!.id;
      }

      // 本を重複なしで取得（最新のレビューのみ）
      const seenBooks = new Set<string>();
      const uniqueBooks = reviews
        .filter((review) => {
          if (seenBooks.has(review.bookId)) {
            return false;
          }
          seenBooks.add(review.bookId);
          return true;
        })
        .map((review) => ({
          ...review.book,
          reviewedBy: {
            id: review.user.id,
            name: review.user.name,
            image: review.user.image,
          },
          rating: review.rating,
          reviewedAt: review.createdAt,
        }));

      return {
        books: uniqueBooks,
        nextCursor,
      };
    }),

  // フォロー中のユーザーの活動フィード
  getFollowingActivity: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        return { activities: [], nextCursor: undefined };
      }

      const userId = ctx.session.user.id;

      // フォロー中のユーザーIDを取得
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      const followingIds = following.map((f) => f.followingId);

      if (followingIds.length === 0) {
        return { activities: [], nextCursor: undefined };
      }

      // レビュー活動を取得
      const reviews = await prisma.review.findMany({
        where: {
          userId: { in: followingIds },
          isPublic: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          book: true,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      // お気に入り活動を取得
      const favorites = await prisma.favoriteBook.findMany({
        where: {
          userId: { in: followingIds },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          book: true,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      // 活動を統合してソート
      const activities = [
        ...reviews.map((review) => ({
          id: `review-${review.id}`,
          type: "review" as const,
          user: review.user,
          book: review.book,
          rating: review.rating,
          content: review.content,
          createdAt: review.createdAt,
        })),
        ...favorites.map((favorite) => ({
          id: `favorite-${favorite.id}`,
          type: "favorite" as const,
          user: favorite.user,
          book: favorite.book,
          createdAt: favorite.createdAt,
        })),
      ]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, input.limit);

      return {
        activities,
        nextCursor: undefined, // 簡略化のためページネーション省略
      };
    }),

  // フォロワー間でトレンドの本
  getFollowingTrending: publicProcedure
    .input(
      z.object({
        daysRange: z.number().optional().default(30),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        return [];
      }

      const userId = ctx.session.user.id;

      // フォロー中のユーザーIDを取得
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      const followingIds = following.map((f) => f.followingId);

      if (followingIds.length === 0) {
        return [];
      }

      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - input.daysRange);

      // 期間内のレビューを取得
      const reviews = await prisma.review.findMany({
        where: {
          userId: { in: followingIds },
          isPublic: true,
          createdAt: { gte: dateThreshold },
        },
        include: {
          book: true,
        },
      });

      // 期間内のお気に入りを取得
      const favorites = await prisma.favoriteBook.findMany({
        where: {
          userId: { in: followingIds },
          createdAt: { gte: dateThreshold },
        },
        include: {
          book: true,
        },
      });

      // 本ごとのアクティビティ数を集計
      const bookActivity = new Map<string, { book: any; count: number }>();

      reviews.forEach((review) => {
        const existing = bookActivity.get(review.bookId);
        if (existing) {
          existing.count += 1;
        } else {
          bookActivity.set(review.bookId, { book: review.book, count: 1 });
        }
      });

      favorites.forEach((favorite) => {
        const existing = bookActivity.get(favorite.bookId);
        if (existing) {
          existing.count += 1;
        } else {
          bookActivity.set(favorite.bookId, { book: favorite.book, count: 1 });
        }
      });

      // アクティビティ数でソートして返す
      return Array.from(bookActivity.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, input.limit)
        .map((item) => ({
          ...item.book,
          activityCount: item.count,
        }));
    }),

  // ============================================
  // ランキングエンドポイント
  // ============================================

  // 最高評価の本
  getHighestRated: publicProcedure
    .input(
      z.object({
        minReviewCount: z.number().optional().default(5),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input }) => {
      const books = await prisma.book.findMany({
        where: {
          reviewCount: { gte: input.minReviewCount },
        },
        orderBy: [{ averageRating: "desc" }, { reviewCount: "desc" }],
        take: input.limit,
        include: {
          _count: {
            select: { reviews: true },
          },
        },
      });

      return books;
    }),

  // トレンド本（全体）
  getTrending: publicProcedure
    .input(
      z.object({
        daysRange: z.number().optional().default(30),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input }) => {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - input.daysRange);

      // 期間内のレビューを集計
      const reviews = await prisma.review.findMany({
        where: {
          createdAt: { gte: dateThreshold },
        },
        select: {
          bookId: true,
        },
      });

      // 期間内のお気に入りを集計
      const favorites = await prisma.favoriteBook.findMany({
        where: {
          createdAt: { gte: dateThreshold },
        },
        select: {
          bookId: true,
        },
      });

      // 本ごとのアクティビティ数を集計
      const activityCount = new Map<string, number>();

      reviews.forEach((review) => {
        activityCount.set(
          review.bookId,
          (activityCount.get(review.bookId) || 0) + 1
        );
      });

      favorites.forEach((favorite) => {
        activityCount.set(
          favorite.bookId,
          (activityCount.get(favorite.bookId) || 0) + 1
        );
      });

      // トップのbookIdを取得
      const topBookIds = Array.from(activityCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, input.limit)
        .map(([bookId]) => bookId);

      if (topBookIds.length === 0) {
        return [];
      }

      // 本の詳細を取得
      const books = await prisma.book.findMany({
        where: {
          id: { in: topBookIds },
        },
        include: {
          _count: {
            select: { reviews: true },
          },
        },
      });

      // アクティビティ数でソート
      return books
        .map((book) => ({
          ...book,
          activityCount: activityCount.get(book.id) || 0,
        }))
        .sort((a, b) => b.activityCount - a.activityCount);
    }),

  // カテゴリ別の本
  getByCategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
        sortBy: z
          .enum(["popular", "rating", "recent", "trending"])
          .optional()
          .default("popular"),
        limit: z.number().optional().default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let orderBy: any = { reviewCount: "desc" };

      switch (input.sortBy) {
        case "rating":
          orderBy = [{ averageRating: "desc" }, { reviewCount: "desc" }];
          break;
        case "recent":
          orderBy = { createdAt: "desc" };
          break;
        case "trending":
          orderBy = { reviewCount: "desc" }; // 簡略化: trending は人気順と同じ
          break;
        default:
          orderBy = { reviewCount: "desc" };
      }

      const books = await prisma.book.findMany({
        where: {
          categories: {
            has: input.category,
          },
        },
        orderBy,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          _count: {
            select: { reviews: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (books.length > input.limit) {
        const nextItem = books.pop();
        nextCursor = nextItem!.id;
      }

      return {
        books,
        nextCursor,
      };
    }),

  // ============================================
  // カテゴリ発見
  // ============================================

  // 全カテゴリ取得
  getCategories: publicProcedure.query(async () => {
    const books = await prisma.book.findMany({
      select: {
        categories: true,
      },
    });

    // カテゴリを抽出して集計
    const categoryCount = new Map<string, number>();

    books.forEach((book) => {
      book.categories.forEach((category) => {
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
      });
    });

    // カテゴリと本数を返す
    return Array.from(categoryCount.entries())
      .map(([category, count]) => ({
        category,
        bookCount: count,
      }))
      .sort((a, b) => b.bookCount - a.bookCount);
  }),

  // ============================================
  // パーソナライズ推薦
  // ============================================

  // レビュー履歴ベースの推薦
  getRecommendationsFromReviews: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        return [];
      }

      const userId = ctx.session.user.id;

      // ユーザーのレビューを取得
      const userReviews = await prisma.review.findMany({
        where: { userId },
        include: {
          book: {
            select: {
              categories: true,
            },
          },
        },
      });

      if (userReviews.length === 0) {
        return [];
      }

      // 高評価の本のカテゴリを抽出（評価4以上）
      const favoriteCategories = new Set<string>();
      userReviews.forEach((review) => {
        if (review.rating >= 4) {
          review.book.categories.forEach((category) => {
            favoriteCategories.add(category);
          });
        }
      });

      if (favoriteCategories.size === 0) {
        return [];
      }

      // 既にレビューした本のIDを取得
      const reviewedBookIds = userReviews.map((r) => r.bookId);

      // 同じカテゴリの高評価本を検索
      const recommendations = await prisma.book.findMany({
        where: {
          categories: {
            hasSome: Array.from(favoriteCategories),
          },
          id: {
            notIn: reviewedBookIds,
          },
          averageRating: {
            gte: 3.5,
          },
          reviewCount: {
            gte: 3,
          },
        },
        orderBy: [{ averageRating: "desc" }, { reviewCount: "desc" }],
        take: input.limit,
        include: {
          _count: {
            select: { reviews: true },
          },
        },
      });

      return recommendations;
    }),

  // 類似読者からの推薦（簡略版）
  getSimilarReaderRecommendations: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        return [];
      }

      const userId = ctx.session.user.id;

      // ユーザーのレビューを取得
      const userReviews = await prisma.review.findMany({
        where: { userId },
        select: {
          bookId: true,
          rating: true,
        },
      });

      if (userReviews.length === 0) {
        return [];
      }

      // ユーザーがレビューした本のID
      const userBookIds = userReviews.map((r) => r.bookId);

      // 同じ本をレビューした他のユーザーを検索
      const similarUsers = await prisma.review.findMany({
        where: {
          bookId: { in: userBookIds },
          userId: { not: userId },
        },
        select: {
          userId: true,
        },
        distinct: ["userId"],
        take: 10, // 最大10人の類似ユーザー
      });

      if (similarUsers.length === 0) {
        return [];
      }

      const similarUserIds = similarUsers.map((u) => u.userId);

      // 類似ユーザーが高評価した本を取得
      const recommendations = await prisma.review.findMany({
        where: {
          userId: { in: similarUserIds },
          rating: { gte: 4 },
          bookId: { notIn: userBookIds },
        },
        include: {
          book: {
            include: {
              _count: {
                select: { reviews: true },
              },
            },
          },
        },
        orderBy: { rating: "desc" },
        take: input.limit,
      });

      // 本を重複なしで取得
      const seenBooks = new Set<string>();
      const uniqueBooks = recommendations
        .filter((review) => {
          if (seenBooks.has(review.bookId)) {
            return false;
          }
          seenBooks.add(review.bookId);
          return true;
        })
        .map((review) => review.book);

      return uniqueBooks;
    }),

  // ============================================
  // ユーザーランキング
  // ============================================

  // 投稿数ランキング - レビュー数が多いユーザー
  getTopReviewers: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }) => {
      const users = await prisma.user.findMany({
        include: {
          _count: {
            select: {
              reviews: true,
              followers: true,
              following: true,
            },
          },
        },
        orderBy: {
          reviews: {
            _count: "desc",
          },
        },
        take: input.limit,
      });

      // レビュー数が0のユーザーは除外
      return users.filter((user) => user._count.reviews > 0);
    }),

  // フォロワー数ランキング - フォロワーが多いユーザー
  getTopFollowed: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }) => {
      // フォロワー数をカウント
      const usersWithFollowers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          _count: {
            select: {
              followers: true,
              reviews: true,
              following: true,
            },
          },
        },
      });

      // フォロワー数でソート
      const sortedUsers = usersWithFollowers
        .filter((user) => user._count.followers > 0)
        .sort((a, b) => b._count.followers - a._count.followers)
        .slice(0, input.limit);

      return sortedUsers;
    }),

  // ============================================
  // 企業内限定コンテンツフィード
  // ============================================

  // 企業内のアクティビティフィード
  getCompanyActivity: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        return { activities: [], nextCursor: undefined };
      }

      // ユーザーの企業IDを取得
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        return { activities: [], nextCursor: undefined };
      }

      // 企業メンバーのIDを取得
      const companyMembers = await prisma.user.findMany({
        where: { companyId: user.companyId },
        select: { id: true },
      });

      const memberIds = companyMembers.map((m) => m.id);

      // レビュー活動を取得
      const reviews = await prisma.review.findMany({
        where: {
          userId: { in: memberIds },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          book: true,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      // お気に入り活動を取得
      const favorites = await prisma.favoriteBook.findMany({
        where: {
          userId: { in: memberIds },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          book: true,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      // 活動を統合してソート
      const activities = [
        ...reviews.map((review) => ({
          id: `review-${review.id}`,
          type: "review" as const,
          user: review.user,
          book: review.book,
          rating: review.rating,
          content: review.content,
          createdAt: review.createdAt,
        })),
        ...favorites.map((favorite) => ({
          id: `favorite-${favorite.id}`,
          type: "favorite" as const,
          user: favorite.user,
          book: favorite.book,
          createdAt: favorite.createdAt,
        })),
      ]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, input.limit);

      return {
        activities,
        nextCursor: undefined,
      };
    }),

  // 企業内で人気の本
  getCompanyPopularBooks: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        return [];
      }

      // ユーザーの企業IDを取得
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        return [];
      }

      // 企業メンバーのレビューを集計
      const reviews = await prisma.review.findMany({
        where: {
          user: {
            companyId: user.companyId,
          },
        },
        select: {
          bookId: true,
          rating: true,
        },
      });

      // 本ごとの統計を計算
      const bookStats = new Map<string, { count: number; totalRating: number }>();

      reviews.forEach((review) => {
        const existing = bookStats.get(review.bookId);
        if (existing) {
          existing.count += 1;
          existing.totalRating += review.rating;
        } else {
          bookStats.set(review.bookId, {
            count: 1,
            totalRating: review.rating,
          });
        }
      });

      // レビュー数でソート
      const topBookIds = Array.from(bookStats.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, input.limit)
        .map(([bookId]) => bookId);

      if (topBookIds.length === 0) {
        return [];
      }

      // 本の詳細を取得
      const books = await prisma.book.findMany({
        where: {
          id: { in: topBookIds },
        },
        include: {
          _count: {
            select: { reviews: true },
          },
        },
      });

      // 企業内の統計を付加
      return books
        .map((book) => {
          const stats = bookStats.get(book.id)!;
          return {
            ...book,
            companyReviewCount: stats.count,
            companyAverageRating: stats.totalRating / stats.count,
          };
        })
        .sort((a, b) => b.companyReviewCount - a.companyReviewCount);
    }),

  // 企業内のトップレビュアー
  getCompanyTopReviewers: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        return [];
      }

      // ユーザーの企業IDを取得
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { companyId: true },
      });

      if (!user?.companyId) {
        return [];
      }

      // 企業メンバーを取得
      const members = await prisma.user.findMany({
        where: {
          companyId: user.companyId,
        },
        include: {
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: {
          reviews: {
            _count: "desc",
          },
        },
        take: input.limit,
      });

      return members.filter((member) => member._count.reviews > 0);
    }),

  // 毎日のおすすめ本を取得
  getDailyRecommendations: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(5),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        // 未ログインユーザーには人気の本を返す
        const books = await prisma.book.findMany({
          where: {
            reviewCount: { gt: 0 },
          },
          orderBy: [
            { reviewCount: "desc" },
            { averageRating: "desc" },
          ],
          take: input.limit,
        });

        return { books };
      }

      const userId = ctx.session.user.id;

      // ユーザーの選好ジャンルを取得
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferredGenres: true },
      });

      // フォロー中のユーザーがレビューした本のカテゴリを取得
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      const followingIds = following.map((f) => f.followingId);

      let recommendedBooks: any[] = [];

      // 1. ユーザーのジャンル設定に基づく推薦
      if (user?.preferredGenres && user.preferredGenres.length > 0) {
        const genreBasedBooks = await prisma.book.findMany({
          where: {
            categories: {
              hasSome: user.preferredGenres,
            },
            reviewCount: { gt: 0 },
            // 既読の本は除外
            NOT: {
              readingStatuses: {
                some: {
                  userId,
                  status: "COMPLETED",
                },
              },
            },
          },
          orderBy: [
            { averageRating: "desc" },
            { reviewCount: "desc" },
          ],
          take: Math.ceil(input.limit / 2),
        });

        recommendedBooks.push(...genreBasedBooks);
      }

      // 2. フォロー中のユーザーが高評価した本
      if (followingIds.length > 0) {
        const followingRecommendedBooks = await prisma.book.findMany({
          where: {
            reviews: {
              some: {
                userId: { in: followingIds },
                rating: { gte: 4 },
              },
            },
            // 既読の本は除外
            NOT: {
              readingStatuses: {
                some: {
                  userId,
                  status: "COMPLETED",
                },
              },
            },
          },
          orderBy: [
            { averageRating: "desc" },
            { reviewCount: "desc" },
          ],
          take: Math.ceil(input.limit / 2),
          distinct: ["id"],
        });

        recommendedBooks.push(...followingRecommendedBooks);
      }

      // 3. 重複を削除してシャッフル
      const uniqueBooks = Array.from(
        new Map(recommendedBooks.map((book) => [book.id, book])).values()
      );

      // 日付ベースのシード値でシャッフル（毎日同じ順序）
      const today = new Date().toISOString().split("T")[0];
      const seed = parseInt(today.replace(/-/g, ""), 10) % 1000;

      const shuffled = uniqueBooks.sort((a, b) => {
        const hashA = (seed + parseInt(a.id.slice(0, 8), 16)) % 1000;
        const hashB = (seed + parseInt(b.id.slice(0, 8), 16)) % 1000;
        return hashA - hashB;
      });

      // 足りない場合は人気の本で補完
      if (shuffled.length < input.limit) {
        const popularBooks = await prisma.book.findMany({
          where: {
            id: { notIn: shuffled.map((b) => b.id) },
            reviewCount: { gt: 0 },
            NOT: {
              readingStatuses: {
                some: {
                  userId,
                  status: "COMPLETED",
                },
              },
            },
          },
          orderBy: [
            { reviewCount: "desc" },
            { averageRating: "desc" },
          ],
          take: input.limit - shuffled.length,
        });

        shuffled.push(...popularBooks);
      }

      return {
        books: shuffled.slice(0, input.limit),
      };
    }),
});
