import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
  // 現在のユーザー情報を取得
  getCurrent: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        membershipType: true,
        subscriptionStatus: true,
        premiumTrialStartedAt: true,
        premiumTrialEndsAt: true,
        aiUsageCount: true,
        aiUsageResetDate: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            favoriteBooks: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "ユーザーが見つかりません",
      });
    }

    return user;
  }),

  // IDでユーザー情報を取得（他のユーザーのプロフィール表示用）
  getById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: input.userId,
        },
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              reviews: true,
              favoriteBooks: true,
              followers: true,
              following: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ユーザーが見つかりません",
        });
      }

      return user;
    }),

  // プロフィールを更新
  updateProfile: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "名前は必須です").max(100, "名前は100文字以内にしてください"),
        bio: z.string().max(500, "自己紹介は500文字以内にしてください").optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name,
          bio: input.bio,
        },
        select: {
          id: true,
          name: true,
          bio: true,
          image: true,
        },
      });

      return updatedUser;
    }),

  // ユーザーの統計情報を取得
  getStats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    const [reviewCount, favoriteCount, aiSummaryCount] = await Promise.all([
      prisma.review.count({
        where: { userId: ctx.session.user.id },
      }),
      prisma.favoriteBook.count({
        where: { userId: ctx.session.user.id },
      }),
      prisma.aISummary.count({
        where: { userId: ctx.session.user.id },
      }),
    ]);

    return {
      reviewCount,
      favoriteCount,
      aiSummaryCount,
    };
  }),

  // Premium ステータスを取得（トライアル状態を含む）
  getPremiumStatus: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        membershipType: true,
        subscriptionStatus: true,
        premiumTrialStartedAt: true,
        premiumTrialEndsAt: true,
        currentPeriodEnd: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "ユーザーが見つかりません",
      });
    }

    const now = new Date();
    const isTrialActive = user.premiumTrialEndsAt ? user.premiumTrialEndsAt > now : false;
    const isSubscriptionActive = user.subscriptionStatus === "ACTIVE";
    const isPremium = isSubscriptionActive || isTrialActive;

    return {
      isPremium,
      isTrialActive,
      isSubscriptionActive,
      trialEndsAt: user.premiumTrialEndsAt,
      subscriptionEndsAt: user.currentPeriodEnd,
      membershipType: user.membershipType,
    };
  }),

  // Premium トライアルを開始（2週間無料）
  startPremiumTrial: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        premiumTrialStartedAt: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "ユーザーが見つかりません",
      });
    }

    // すでにトライアルを使用済み
    if (user.premiumTrialStartedAt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "トライアルは一度のみご利用いただけます",
      });
    }

    // すでにサブスクリプションがアクティブ
    if (user.subscriptionStatus === "ACTIVE") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "すでにPREMIUMプランをご利用中です",
      });
    }

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2週間後

    const updatedUser = await prisma.user.update({
      where: { id: ctx.session.user.id },
      data: {
        membershipType: "PREMIUM",
        premiumTrialStartedAt: now,
        premiumTrialEndsAt: trialEndsAt,
      },
    });

    return {
      success: true,
      trialStartedAt: updatedUser.premiumTrialStartedAt,
      trialEndsAt: updatedUser.premiumTrialEndsAt,
    };
  }),
});
