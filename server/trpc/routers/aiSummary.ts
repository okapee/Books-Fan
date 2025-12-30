import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { generateReviewSummary, generateBookSummary } from "@/server/services/openai";

export const aiSummaryRouter = router({
  // レビューのAI要約を生成
  generate: publicProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      // プレミアム会員チェック
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          membershipType: true,
          aiUsageCount: true,
          aiUsageResetDate: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ユーザーが見つかりません",
        });
      }

      if (user.membershipType !== "PREMIUM") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "プレミアム会員のみ利用可能な機能です",
        });
      }

      // 月次リセットのチェック
      const now = new Date();
      const resetDate = new Date(user.aiUsageResetDate);
      if (now > resetDate) {
        // 使用回数をリセット
        await prisma.user.update({
          where: { id: ctx.session.user.id },
          data: {
            aiUsageCount: 0,
            aiUsageResetDate: new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              1
            ),
          },
        });
      }

      // レビューを取得
      const review = await prisma.review.findUnique({
        where: { id: input.reviewId },
        include: {
          book: {
            select: {
              title: true,
              author: true,
            },
          },
        },
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "レビューが見つかりません",
        });
      }

      // 既存の要約をチェック
      const existingSummary = await prisma.aISummary.findUnique({
        where: { reviewId: input.reviewId },
      });

      if (existingSummary) {
        return existingSummary;
      }

      // AI要約を生成（マインドマップ構造も含む）
      const { summaryText, keyPoints, mindmapStructure } = await generateReviewSummary(
        review.content,
        review.book.title,
        review.book.author
      );

      // 要約をデータベースに保存
      const aiSummary = await prisma.aISummary.create({
        data: {
          userId: ctx.session.user.id,
          bookId: review.bookId,
          reviewId: input.reviewId,
          summaryText,
          keyPoints,
          visualizationData: { mindmap: mindmapStructure },
        },
      });

      // AI使用回数を更新
      await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          aiUsageCount: {
            increment: 1,
          },
        },
      });

      return aiSummary;
    }),

  // 本のAI要約を生成（プレミアム限定）
  generateForBook: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      // プレミアム会員チェックと使用制限チェック
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          membershipType: true,
          aiUsageCount: true,
          aiUsageResetDate: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ユーザーが見つかりません",
        });
      }

      if (user.membershipType !== "PREMIUM") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "プレミアム会員のみ利用可能な機能です",
        });
      }

      // 月次リセットのチェック
      const now = new Date();
      const resetDate = new Date(user.aiUsageResetDate);
      let currentUsageCount = user.aiUsageCount;

      if (now > resetDate) {
        // 使用回数をリセット
        await prisma.user.update({
          where: { id: ctx.session.user.id },
          data: {
            aiUsageCount: 0,
            aiUsageResetDate: new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              1
            ),
          },
        });
        currentUsageCount = 0;
      }

      // 使用回数制限チェック（月30回）
      if (currentUsageCount >= 30) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "今月のAI使用回数の上限に達しました。来月1日にリセットされます。",
        });
      }

      // まず共有されている本の要約をチェック（reviewIdがnullのもののみ）
      const sharedSummary = await prisma.aISummary.findFirst({
        where: {
          bookId: input.bookId,
          reviewId: null, // 本レベルの要約のみ
          isShared: true,
          isPublic: true,
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (sharedSummary) {
        // 共有要約が存在する場合は、それを返す（新規生成不要）
        return sharedSummary;
      }

      // 既存の自分の本の要約をチェック（reviewIdがnullのもののみ）
      const existingSummary = await prisma.aISummary.findFirst({
        where: {
          userId: ctx.session.user.id,
          bookId: input.bookId,
          reviewId: null, // 本レベルの要約のみ
        },
      });

      if (existingSummary) {
        return existingSummary;
      }

      // 本を取得
      const book = await prisma.book.findUnique({
        where: { id: input.bookId },
        select: {
          title: true,
          author: true,
          description: true,
        },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "本が見つかりません",
        });
      }

      // AI要約を生成
      const { summaryText, keyPoints } = await generateBookSummary(
        book.title,
        book.author,
        book.description
      );

      // 要約をデータベースに保存
      const aiSummary = await prisma.aISummary.create({
        data: {
          userId: ctx.session.user.id,
          bookId: input.bookId,
          summaryText,
          keyPoints: keyPoints,
        },
      });

      // AI使用回数を更新
      await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          aiUsageCount: {
            increment: 1,
          },
        },
      });

      return aiSummary;
    }),

  // bookIdでAI要約を取得（本レベルの要約のみ、共有要約を優先）
  getByBookId: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ input, ctx }) => {
      // まず共有されている本の要約を探す（reviewIdがnullのもののみ）
      const sharedSummary = await prisma.aISummary.findFirst({
        where: {
          bookId: input.bookId,
          reviewId: null, // 本レベルの要約のみ
          isShared: true,
          isPublic: true,
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc", // 最初に作成されたものを使用
        },
      });

      if (sharedSummary) {
        return sharedSummary;
      }

      // 共有要約がなければ、ユーザー自身の本の要約を探す（reviewIdがnullのもののみ）
      if (ctx.session?.user?.id) {
        const userSummary = await prisma.aISummary.findFirst({
          where: {
            userId: ctx.session.user.id,
            bookId: input.bookId,
            reviewId: null, // 本レベルの要約のみ
          },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        });

        if (userSummary) {
          return userSummary;
        }
      }

      return null;
    }),

  // レビューIDでAI要約を取得
  getByReviewId: publicProcedure
    .input(z.object({ reviewId: z.string() }))
    .query(async ({ input }) => {
      const summary = await prisma.aISummary.findUnique({
        where: { reviewId: input.reviewId },
      });

      return summary;
    }),

  // 複数のレビューIDでAI要約を一括取得
  getByReviewIds: publicProcedure
    .input(z.object({ reviewIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      const summaries = await prisma.aISummary.findMany({
        where: {
          reviewId: {
            in: input.reviewIds,
          },
        },
      });

      return summaries;
    }),

  // AI要約を削除
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

      const summary = await prisma.aISummary.findUnique({
        where: { id: input.id },
        include: {
          review: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!summary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "AI要約が見つかりません",
        });
      }

      // レビューの所有者のみ削除可能
      if (summary.review?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "この要約を削除する権限がありません",
        });
      }

      await prisma.aISummary.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
