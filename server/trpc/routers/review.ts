import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { getBookById, convertGoogleBookToBook } from "@/server/services/googleBooks";
import { generateReviewSummary } from "@/server/services/openai";

export const reviewRouter = router({
  // レビューIDで特定のレビューを取得
  getById: publicProcedure
    .input(z.object({ reviewId: z.string() }))
    .query(async ({ input }) => {
      const review = await prisma.review.findUnique({
        where: { id: input.reviewId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return review;
    }),

  // 本のレビューを取得
  getByBookId: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ input, ctx }) => {
      // 現在のユーザーの企業IDを取得
      let currentUserCompanyId: string | null = null;
      if (ctx.session?.user?.id) {
        const currentUser = await prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { companyId: true },
        });
        currentUserCompanyId = currentUser?.companyId || null;
      }

      // レビューを取得
      const reviews = await prisma.review.findMany({
        where: { bookId: input.bookId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              companyId: true,
              company: {
                select: {
                  id: true,
                  allowPublicContent: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // 企業コンテンツの可視性制御でフィルタリング
      const filteredReviews = reviews.filter((review) => {
        // レビュー作成者が企業に所属していない場合は常に表示
        if (!review.user.companyId) {
          return true;
        }

        // レビュー作成者の企業が公開を許可している場合は表示
        if (review.user.company?.allowPublicContent) {
          return true;
        }

        // 同じ企業のユーザーには表示
        if (currentUserCompanyId === review.user.companyId) {
          return true;
        }

        // それ以外は非表示
        return false;
      });

      // ユーザー情報から企業情報を除外して返す
      return filteredReviews.map((review) => ({
        ...review,
        user: {
          id: review.user.id,
          name: review.user.name,
          image: review.user.image,
        },
      }));
    }),

  // レビューを作成
  create: publicProcedure
    .input(
      z.object({
        googleBooksId: z.string(),
        rating: z.number().min(1).max(5),
        content: z.string().min(30),
        isPublic: z.boolean().default(true),
        readCompletedDate: z.date().optional(),
        generateAISummary: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const userId = ctx.session.user.id;

      // 本をデータベースに保存または取得
      let bookData = await prisma.book.findUnique({
        where: { googleBooksId: input.googleBooksId },
      });

      // 存在しない場合、Google Books APIから取得して保存
      if (!bookData) {
        try {
          const volume = await getBookById(input.googleBooksId);
          const bookInfo = convertGoogleBookToBook(volume);

          bookData = await prisma.book.create({
            data: bookInfo,
          });
        } catch (error) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "本が見つかりません",
          });
        }
      }

      // 既存のレビューをチェック（同じユーザーが同じ本に対して複数レビューを投稿できないようにする）
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          bookId: bookData.id,
        },
      });

      if (existingReview) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "この本にはすでにレビューを投稿しています。既存のレビューを編集してください。",
        });
      }

      // レビューを作成
      const review = await prisma.review.create({
        data: {
          userId,
          bookId: bookData.id,
          rating: input.rating,
          content: input.content,
          isPublic: input.isPublic,
          readCompletedDate: input.readCompletedDate,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // 本の平均評価を更新
      const avgRating = await prisma.review.aggregate({
        where: { bookId: bookData.id },
        _avg: { rating: true },
        _count: true,
      });

      await prisma.book.update({
        where: { id: bookData.id },
        data: {
          averageRating: avgRating._avg.rating || 0,
          reviewCount: avgRating._count,
        },
      });

      // 読書ステータスを自動更新（READINGの場合はCOMPLETEDに）
      const readingStatus = await prisma.readingStatus.findUnique({
        where: {
          userId_bookId: {
            userId,
            bookId: bookData.id,
          },
        },
      });

      if (readingStatus && readingStatus.status === "READING") {
        await prisma.readingStatus.update({
          where: { id: readingStatus.id },
          data: {
            status: "COMPLETED",
            completedAt: input.readCompletedDate || new Date(),
          },
        });
      }

      // AI要約を生成（プレミアムユーザーのみ、かつフラグがtrueの場合）
      if (input.generateAISummary) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { membershipType: true, aiUsageCount: true, aiUsageResetDate: true },
        });

        if (user && user.membershipType === "PREMIUM") {
          try {
            // AI要約を生成（マインドマップ構造も含む）
            const { summaryText, keyPoints, mindmapStructure } = await generateReviewSummary(
              input.content,
              bookData.title,
              bookData.author
            );

            // AI要約を保存
            await prisma.aISummary.create({
              data: {
                userId,
                bookId: bookData.id,
                reviewId: review.id,
                summaryText,
                keyPoints,
                visualizationData: { mindmap: mindmapStructure },
              },
            });

            // AI使用回数を更新
            await prisma.user.update({
              where: { id: userId },
              data: {
                aiUsageCount: {
                  increment: 1,
                },
              },
            });
          } catch (error) {
            // AI要約生成に失敗してもレビューは作成されるのでエラーは無視
            console.error("AI summary generation failed:", error);
          }
        }
      }

      return review;
    }),

  // レビューを更新
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        rating: z.number().min(1).max(5).optional(),
        content: z.string().min(30).optional(),
        isPublic: z.boolean().optional(),
        readCompletedDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const { id, ...data } = input;

      // レビューの所有者確認
      const existingReview = await prisma.review.findUnique({
        where: { id },
      });

      if (!existingReview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "レビューが見つかりません",
        });
      }

      if (existingReview.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "このレビューを編集する権限がありません",
        });
      }

      const review = await prisma.review.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // 本の平均評価を再計算
      const avgRating = await prisma.review.aggregate({
        where: { bookId: review.bookId },
        _avg: { rating: true },
        _count: true,
      });

      await prisma.book.update({
        where: { id: review.bookId },
        data: {
          averageRating: avgRating._avg.rating || 0,
          reviewCount: avgRating._count,
        },
      });

      return review;
    }),

  // レビューを削除
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const review = await prisma.review.findUnique({
        where: { id: input.id },
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "レビューが見つかりません",
        });
      }

      // レビューの所有者確認
      if (review.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "このレビューを削除する権限がありません",
        });
      }

      await prisma.review.delete({
        where: { id: input.id },
      });

      // 本の平均評価を再計算
      const avgRating = await prisma.review.aggregate({
        where: { bookId: review.bookId },
        _avg: { rating: true },
        _count: true,
      });

      await prisma.book.update({
        where: { id: review.bookId },
        data: {
          averageRating: avgRating._avg.rating || 0,
          reviewCount: avgRating._count,
        },
      });

      return { success: true };
    }),

  // ユーザーのレビューを取得
  getByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const reviews = await prisma.review.findMany({
        where: { userId: input.userId },
        include: {
          book: true,
        },
        orderBy: { createdAt: "desc" },
        ...(input.limit && { take: input.limit }),
      });

      return reviews;
    }),

  // レビューにいいねを追加
  addLike: publicProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      // 既存のいいねをチェック
      const existingLike = await prisma.reviewLike.findUnique({
        where: {
          userId_reviewId: {
            userId: ctx.session.user.id,
            reviewId: input.reviewId,
          },
        },
      });

      if (existingLike) {
        return { success: true, message: "すでにいいね済みです" };
      }

      // いいねを追加
      await prisma.reviewLike.create({
        data: {
          userId: ctx.session.user.id,
          reviewId: input.reviewId,
        },
      });

      // レビューの作成者を取得
      const review = await prisma.review.findUnique({
        where: { id: input.reviewId },
        select: {
          userId: true,
          book: {
            select: {
              googleBooksId: true,
            },
          },
        },
      });

      // 自分自身のレビューには通知を送らない
      if (review && review.userId !== ctx.session.user.id) {
        // いいねしたユーザーの情報を取得
        const liker = await prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { name: true },
        });

        // 通知を作成
        await prisma.notification.create({
          data: {
            type: "REVIEW_LIKE",
            senderId: ctx.session.user.id,
            receiverId: review.userId,
            reviewId: input.reviewId,
            bookGoogleId: review.book.googleBooksId,
            message: `${liker?.name || "誰か"}があなたのレビューにいいねしました`,
          },
        });
      }

      return { success: true };
    }),

  // レビューのいいねを削除
  removeLike: publicProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      await prisma.reviewLike.deleteMany({
        where: {
          userId: ctx.session.user.id,
          reviewId: input.reviewId,
        },
      });

      return { success: true };
    }),

  // レビューのいいね数を取得
  getLikeCount: publicProcedure
    .input(z.object({ reviewId: z.string() }))
    .query(async ({ input }) => {
      const count = await prisma.reviewLike.count({
        where: { reviewId: input.reviewId },
      });

      return count;
    }),

  // ユーザーがいいねしているかチェック
  checkLike: publicProcedure
    .input(z.object({ reviewId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        return { isLiked: false };
      }

      const like = await prisma.reviewLike.findUnique({
        where: {
          userId_reviewId: {
            userId: ctx.session.user.id,
            reviewId: input.reviewId,
          },
        },
      });

      return { isLiked: !!like };
    }),

  // レビューのコメントを取得
  getComments: publicProcedure
    .input(z.object({ reviewId: z.string() }))
    .query(async ({ input }) => {
      const comments = await prisma.reviewComment.findMany({
        where: { reviewId: input.reviewId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return comments;
    }),

  // コメントを追加
  addComment: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const comment = await prisma.reviewComment.create({
        data: {
          userId: ctx.session.user.id,
          reviewId: input.reviewId,
          content: input.content,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // レビューの作成者を取得
      const review = await prisma.review.findUnique({
        where: { id: input.reviewId },
        select: {
          userId: true,
          book: {
            select: {
              googleBooksId: true,
            },
          },
        },
      });

      // 自分自身のレビューには通知を送らない
      if (review && review.userId !== ctx.session.user.id) {
        // コメントしたユーザーの情報を取得
        const commenter = await prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { name: true },
        });

        // 通知を作成
        await prisma.notification.create({
          data: {
            type: "REVIEW_COMMENT",
            senderId: ctx.session.user.id,
            receiverId: review.userId,
            reviewId: input.reviewId,
            bookGoogleId: review.book.googleBooksId,
            commentId: comment.id,
            message: `${commenter?.name || "誰か"}があなたのレビューにコメントしました`,
          },
        });
      }

      return comment;
    }),

  // コメントを削除
  deleteComment: publicProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const comment = await prisma.reviewComment.findUnique({
        where: { id: input.commentId },
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "コメントが見つかりません",
        });
      }

      // コメントの所有者確認
      if (comment.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "このコメントを削除する権限がありません",
        });
      }

      await prisma.reviewComment.delete({
        where: { id: input.commentId },
      });

      return { success: true };
    }),
});
