import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { stripe } from "@/lib/stripe";

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
        currentPeriodEnd: true,
        companyId: true,
        aiUsageCount: true,
        aiUsageResetDate: true,
        preferredGenres: true,
        hasCompletedGenreSelection: true,
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

  // ジャンル設定を更新
  updateGenrePreferences: publicProcedure
    .input(
      z.object({
        genres: z.array(z.string()),
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
          preferredGenres: input.genres,
          hasCompletedGenreSelection: true,
        },
        select: {
          id: true,
          preferredGenres: true,
          hasCompletedGenreSelection: true,
        },
      });

      return updatedUser;
    }),

  // アカウント削除（退会）
  deleteAccount: publicProcedure
    .input(
      z.object({
        confirmation: z.string().refine((val) => val === "DELETE", {
          message: "確認文字列が一致しません",
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const userId = ctx.session.user.id;

      // ユーザー情報を取得（Stripe連携情報を確認）
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          stripeSubscriptionId: true,
          stripeCustomerId: true,
          membershipType: true,
          currentPeriodEnd: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ユーザーが見つかりません",
        });
      }

      // Stripeのサブスクリプションがある場合、期間終了時にキャンセル
      if (user.stripeSubscriptionId) {
        try {
          // サブスクリプションを期間終了時にキャンセル（即座にはキャンセルしない）
          await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
            metadata: {
              cancelled_by_user: "true",
              cancellation_reason: "account_deletion",
            },
          });

          console.log(
            `Stripe subscription ${user.stripeSubscriptionId} set to cancel at period end for user ${userId}`
          );
        } catch (error) {
          console.error("Failed to cancel Stripe subscription:", error);
          // Stripe のキャンセルに失敗してもアカウント削除は続行
          // （Webhookで後から処理される可能性があるため）
        }
      }

      // トランザクション内で関連データをすべて削除
      await prisma.$transaction(async (tx) => {
        // ユーザーに関連するデータを削除
        await tx.reviewLike.deleteMany({ where: { userId } });
        await tx.reviewComment.deleteMany({ where: { userId } });
        await tx.review.deleteMany({ where: { userId } });
        await tx.favoriteBook.deleteMany({ where: { userId } });
        await tx.readingStatus.deleteMany({ where: { userId } });
        await tx.aISummary.deleteMany({ where: { userId } });
        await tx.notification.deleteMany({ where: { OR: [{ receiverId: userId }, { senderId: userId }] } });
        await tx.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } });

        // 最後にユーザー自体を削除
        await tx.user.delete({ where: { id: userId } });
      });

      return {
        success: true,
        message: user.stripeSubscriptionId
          ? "アカウントを削除しました。サブスクリプションは現在の課金期間終了時に自動的にキャンセルされます。"
          : "アカウントを削除しました",
        subscriptionCancelled: !!user.stripeSubscriptionId,
        currentPeriodEnd: user.currentPeriodEnd,
      };
    }),
});
