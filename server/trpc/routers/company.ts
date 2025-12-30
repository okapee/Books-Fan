import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { sendCompanyInvitationEmail } from "@/server/services/email";
import {
  createCorporateCheckoutSession,
  createCorporatePortalSession,
} from "@/server/services/stripe-corporate";

export const companyRouter = router({
  // 企業を作成（管理者登録時）
  createCompany: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "会社名を入力してください"),
        slug: z
          .string()
          .min(1, "スラッグを入力してください")
          .regex(
            /^[a-z0-9-]+$/,
            "スラッグは小文字の英数字とハイフンのみ使用できます"
          ),
        domain: z.string().optional(),
        maxUsers: z.number().default(100),
        contractType: z.enum(["MONTHLY", "ANNUAL"]).default("MONTHLY"),
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

      // 既に企業に所属していないかチェック
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { companyId: true },
      });

      if (user?.companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "既に企業に所属しています",
        });
      }

      // スラッグの重複チェック
      const existingCompany = await prisma.company.findUnique({
        where: { slug: input.slug },
      });

      if (existingCompany) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "このスラッグは既に使用されています",
        });
      }

      // 企業を作成
      const company = await prisma.company.create({
        data: {
          name: input.name,
          slug: input.slug,
          domain: input.domain,
          maxUsers: input.maxUsers,
          contractType: input.contractType,
          plan: "CORPORATE",
        },
      });

      // ユーザーを企業の管理者として設定
      await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          companyId: company.id,
          companyRole: "ADMIN",
          membershipType: "CORPORATE",
        },
      });

      return company;
    }),

  // ユーザーを招待
  inviteUser: publicProcedure
    .input(
      z.object({
        email: z.string().email("有効なメールアドレスを入力してください"),
        role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
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

      // 管理者権限チェック
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          name: true,
          companyId: true,
          companyRole: true,
          company: {
            select: {
              id: true,
              name: true,
              maxUsers: true,
              users: {
                select: { id: true },
              },
            },
          },
        },
      });

      if (!user?.companyId || user.companyRole !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "企業管理者のみ招待できます",
        });
      }

      // ユーザー数制限チェック
      const currentUserCount = user.company?.users.length || 0;
      if (currentUserCount >= (user.company?.maxUsers || 100)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ユーザー数の上限に達しています",
        });
      }

      // 既に招待済みかチェック
      const existingInvitation = await prisma.companyInvitation.findFirst({
        where: {
          companyId: user.companyId,
          email: input.email,
          status: "PENDING",
        },
      });

      if (existingInvitation) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "このメールアドレスは既に招待済みです",
        });
      }

      // 既にユーザーが存在して企業に所属していないかチェック
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
        select: { companyId: true },
      });

      if (existingUser?.companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "このユーザーは既に別の企業に所属しています",
        });
      }

      // 招待トークンを生成
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7日間有効

      // 招待を作成
      const invitation = await prisma.companyInvitation.create({
        data: {
          companyId: user.companyId,
          email: input.email,
          token,
          role: input.role,
          expiresAt,
        },
        include: {
          company: {
            select: {
              name: true,
            },
          },
        },
      });

      // 招待メールを送信
      await sendCompanyInvitationEmail(
        input.email,
        invitation.company.name,
        user.name || "管理者",
        token,
        input.role
      );

      return invitation;
    }),

  // 招待を受諾
  acceptInvitation: publicProcedure
    .input(
      z.object({
        token: z.string(),
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

      // 招待を検索
      const invitation = await prisma.companyInvitation.findUnique({
        where: { token: input.token },
        include: {
          company: true,
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "招待が見つかりません",
        });
      }

      // 招待の状態チェック
      if (invitation.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "この招待は既に使用されています",
        });
      }

      // 有効期限チェック
      if (new Date() > invitation.expiresAt) {
        await prisma.companyInvitation.update({
          where: { id: invitation.id },
          data: { status: "EXPIRED" },
        });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "招待の有効期限が切れています",
        });
      }

      // ユーザー情報を取得
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          email: true,
          companyId: true,
        },
      });

      // メールアドレスチェック
      if (user?.email !== invitation.email) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "招待されたメールアドレスと一致しません",
        });
      }

      // 既に企業に所属していないかチェック
      if (user.companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "既に企業に所属しています",
        });
      }

      // ユーザー数制限チェック
      const currentUserCount = await prisma.user.count({
        where: { companyId: invitation.companyId },
      });

      if (currentUserCount >= invitation.company.maxUsers) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "企業のユーザー数が上限に達しています",
        });
      }

      // ユーザーを企業に追加
      await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          companyId: invitation.companyId,
          companyRole: invitation.role,
          membershipType: "CORPORATE",
        },
      });

      // 招待を受諾済みに更新
      await prisma.companyInvitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      return invitation.company;
    }),

  // 企業メンバー一覧取得
  getMembers: publicProcedure.query(async ({ ctx }) => {
    // 認証チェック
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    // 企業所属チェック
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "企業に所属していません",
      });
    }

    // メンバー一覧を取得
    const members = await prisma.user.findMany({
      where: { companyId: user.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        companyRole: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return members;
  }),

  // 招待一覧取得
  getInvitations: publicProcedure.query(async ({ ctx }) => {
    // 認証チェック
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    // 管理者権限チェック
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        companyId: true,
        companyRole: true,
      },
    });

    if (!user?.companyId || user.companyRole !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "企業管理者のみアクセスできます",
      });
    }

    // 招待一覧を取得
    const invitations = await prisma.companyInvitation.findMany({
      where: { companyId: user.companyId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invitations;
  }),

  // メンバーを削除
  removeMember: publicProcedure
    .input(
      z.object({
        userId: z.string(),
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

      // 管理者権限チェック
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          companyId: true,
          companyRole: true,
        },
      });

      if (!user?.companyId || user.companyRole !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "企業管理者のみメンバーを削除できます",
        });
      }

      // 自分自身は削除できない
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "自分自身を削除することはできません",
        });
      }

      // メンバーを取得
      const member = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { companyId: true },
      });

      // 同じ企業のメンバーかチェック
      if (member?.companyId !== user.companyId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "このメンバーを削除する権限がありません",
        });
      }

      // メンバーを企業から削除
      await prisma.user.update({
        where: { id: input.userId },
        data: {
          companyId: null,
          companyRole: null,
          membershipType: "FREE",
        },
      });

      return { success: true };
    }),

  // メンバーのロールを更新
  updateMemberRole: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["ADMIN", "MEMBER"]),
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

      // 管理者権限チェック
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          companyId: true,
          companyRole: true,
        },
      });

      if (!user?.companyId || user.companyRole !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "企業管理者のみロールを変更できます",
        });
      }

      // メンバーを取得
      const member = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { companyId: true },
      });

      // 同じ企業のメンバーかチェック
      if (member?.companyId !== user.companyId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "このメンバーのロールを変更する権限がありません",
        });
      }

      // ロールを更新
      await prisma.user.update({
        where: { id: input.userId },
        data: {
          companyRole: input.role,
        },
      });

      return { success: true };
    }),

  // 企業情報を取得
  getCompanyInfo: publicProcedure.query(async ({ ctx }) => {
    // 認証チェック
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    // 企業所属チェック
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "企業に所属していません",
      });
    }

    // 企業情報を取得
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      include: {
        _count: {
          select: {
            users: true,
            invitations: true,
          },
        },
      },
    });

    return company;
  }),

  // 企業設定を更新
  updateSettings: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
        domain: z.string().optional(),
        allowPublicContent: z.boolean().optional(),
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

      // 管理者権限チェック
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          companyId: true,
          companyRole: true,
        },
      });

      if (!user?.companyId || user.companyRole !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "企業管理者のみ設定を変更できます",
        });
      }

      // 設定を更新
      const company = await prisma.company.update({
        where: { id: user.companyId },
        data: input,
      });

      return company;
    }),

  // 使用状況統計を取得
  getUsageStats: publicProcedure.query(async ({ ctx }) => {
    // 認証チェック
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    // 管理者権限チェック
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        companyId: true,
        companyRole: true,
      },
    });

    if (!user?.companyId || user.companyRole !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "企業管理者のみアクセスできます",
      });
    }

    // 企業情報を取得
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: {
        aiUsageCount: true,
        aiUsageLimit: true,
        aiUsageResetDate: true,
        maxUsers: true,
      },
    });

    // ユーザー数を取得
    const userCount = await prisma.user.count({
      where: { companyId: user.companyId },
    });

    // レビュー数を取得（今月）
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const reviewCount = await prisma.review.count({
      where: {
        user: {
          companyId: user.companyId,
        },
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    return {
      users: {
        current: userCount,
        max: company?.maxUsers || 100,
      },
      aiUsage: {
        current: company?.aiUsageCount || 0,
        limit: company?.aiUsageLimit || 1000,
        resetDate: company?.aiUsageResetDate,
      },
      reviews: {
        thisMonth: reviewCount,
      },
    };
  }),

  // ============================================
  // Stripe決済関連
  // ============================================

  // チェックアウトセッションを作成
  createCheckoutSession: publicProcedure.mutation(async ({ ctx }) => {
    // 認証チェック
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    // 管理者権限と企業情報を取得
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        email: true,
        companyId: true,
        companyRole: true,
        company: {
          select: {
            id: true,
            name: true,
            contractType: true,
            maxUsers: true,
            stripeCustomerId: true,
            stripeSubscriptionId: true,
          },
        },
      },
    });

    if (!user?.companyId || user.companyRole !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "企業管理者のみアクセスできます",
      });
    }

    if (!user.company) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "企業が見つかりません",
      });
    }

    // 既にサブスクリプションがある場合はエラー
    if (user.company.stripeSubscriptionId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "既にサブスクリプションが存在します",
      });
    }

    // チェックアウトセッションを作成
    const checkoutUrl = await createCorporateCheckoutSession(
      user.company.id,
      user.company.name,
      user.email || "",
      user.company.contractType as "MONTHLY" | "ANNUAL",
      user.company.maxUsers
    );

    return { url: checkoutUrl };
  }),

  // カスタマーポータルセッションを作成
  createPortalSession: publicProcedure.mutation(async ({ ctx }) => {
    // 認証チェック
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    // 管理者権限と企業情報を取得
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        companyId: true,
        companyRole: true,
        company: {
          select: {
            stripeCustomerId: true,
          },
        },
      },
    });

    if (!user?.companyId || user.companyRole !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "企業管理者のみアクセスできます",
      });
    }

    if (!user.company?.stripeCustomerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Stripeカスタマーが見つかりません",
      });
    }

    // ポータルセッションを作成
    const portalUrl = await createCorporatePortalSession(
      user.company.stripeCustomerId
    );

    return { url: portalUrl };
  }),

  // ============================================
  // 統計レポート
  // ============================================

  // 週次レポートを取得
  getWeeklyReport: publicProcedure.query(async ({ ctx }) => {
    // 認証チェック
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    // 管理者権限チェック
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        companyId: true,
        companyRole: true,
      },
    });

    if (!user?.companyId || user.companyRole !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "企業管理者のみアクセスできます",
      });
    }

    // 今週の開始日（月曜日）
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // 先週の開始日
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);

    // 今週のレビュー数
    const thisWeekReviews = await prisma.review.count({
      where: {
        user: { companyId: user.companyId },
        createdAt: { gte: startOfWeek },
      },
    });

    // 先週のレビュー数
    const lastWeekReviews = await prisma.review.count({
      where: {
        user: { companyId: user.companyId },
        createdAt: { gte: startOfLastWeek, lt: startOfWeek },
      },
    });

    // 今週のお気に入り数
    const thisWeekFavorites = await prisma.favoriteBook.count({
      where: {
        user: { companyId: user.companyId },
        createdAt: { gte: startOfWeek },
      },
    });

    // 今週のアクティブユーザー数
    const activeUsers = await prisma.user.count({
      where: {
        companyId: user.companyId,
        OR: [
          { reviews: { some: { createdAt: { gte: startOfWeek } } } },
          { favoriteBooks: { some: { createdAt: { gte: startOfWeek } } } },
        ],
      },
    });

    // 今週の最も人気の本
    const reviewsThisWeek = await prisma.review.findMany({
      where: {
        user: { companyId: user.companyId },
        createdAt: { gte: startOfWeek },
      },
      select: {
        bookId: true,
        rating: true,
      },
    });

    const bookStats = new Map<string, { count: number; totalRating: number }>();
    reviewsThisWeek.forEach((review) => {
      const existing = bookStats.get(review.bookId);
      if (existing) {
        existing.count += 1;
        existing.totalRating += review.rating;
      } else {
        bookStats.set(review.bookId, { count: 1, totalRating: review.rating });
      }
    });

    const topBookId = Array.from(bookStats.entries()).sort(
      (a, b) => b[1].count - a[1].count
    )[0];

    let topBook = null;
    if (topBookId) {
      topBook = await prisma.book.findUnique({
        where: { id: topBookId[0] },
      });
    }

    return {
      period: "week",
      startDate: startOfWeek,
      endDate: now,
      metrics: {
        reviews: {
          count: thisWeekReviews,
          change: lastWeekReviews > 0
            ? ((thisWeekReviews - lastWeekReviews) / lastWeekReviews) * 100
            : 0,
        },
        favorites: {
          count: thisWeekFavorites,
        },
        activeUsers: {
          count: activeUsers,
        },
      },
      topBook: topBook
        ? {
            ...topBook,
            reviewCount: topBookId[1].count,
            averageRating: topBookId[1].totalRating / topBookId[1].count,
          }
        : null,
    };
  }),

  // 月次レポートを取得
  getMonthlyReport: publicProcedure.query(async ({ ctx }) => {
    // 認証チェック
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    // 管理者権限チェック
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        companyId: true,
        companyRole: true,
      },
    });

    if (!user?.companyId || user.companyRole !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "企業管理者のみアクセスできます",
      });
    }

    // 今月の開始日
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 先月の開始日と終了日
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 今月のレビュー数
    const thisMonthReviews = await prisma.review.count({
      where: {
        user: { companyId: user.companyId },
        createdAt: { gte: startOfMonth },
      },
    });

    // 先月のレビュー数
    const lastMonthReviews = await prisma.review.count({
      where: {
        user: { companyId: user.companyId },
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    // 今月のお気に入り数
    const thisMonthFavorites = await prisma.favoriteBook.count({
      where: {
        user: { companyId: user.companyId },
        createdAt: { gte: startOfMonth },
      },
    });

    // 先月のお気に入り数
    const lastMonthFavorites = await prisma.favoriteBook.count({
      where: {
        user: { companyId: user.companyId },
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    // 今月のアクティブユーザー数
    const activeUsers = await prisma.user.count({
      where: {
        companyId: user.companyId,
        OR: [
          { reviews: { some: { createdAt: { gte: startOfMonth } } } },
          { favoriteBooks: { some: { createdAt: { gte: startOfMonth } } } },
        ],
      },
    });

    // 総ユーザー数
    const totalUsers = await prisma.user.count({
      where: { companyId: user.companyId },
    });

    // 今月の最も人気の本TOP5
    const reviewsThisMonth = await prisma.review.findMany({
      where: {
        user: { companyId: user.companyId },
        createdAt: { gte: startOfMonth },
      },
      select: {
        bookId: true,
        rating: true,
      },
    });

    const bookStats = new Map<string, { count: number; totalRating: number }>();
    reviewsThisMonth.forEach((review) => {
      const existing = bookStats.get(review.bookId);
      if (existing) {
        existing.count += 1;
        existing.totalRating += review.rating;
      } else {
        bookStats.set(review.bookId, { count: 1, totalRating: review.rating });
      }
    });

    const topBookIds = Array.from(bookStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([bookId]) => bookId);

    const topBooks =
      topBookIds.length > 0
        ? await prisma.book.findMany({
            where: { id: { in: topBookIds } },
          })
        : [];

    const topBooksWithStats = topBooks.map((book) => {
      const stats = bookStats.get(book.id)!;
      return {
        ...book,
        reviewCount: stats.count,
        averageRating: stats.totalRating / stats.count,
      };
    });

    // 今月のトップレビュアーTOP5
    const topReviewers = await prisma.user.findMany({
      where: {
        companyId: user.companyId,
        reviews: {
          some: {
            createdAt: { gte: startOfMonth },
          },
        },
      },
      include: {
        _count: {
          select: {
            reviews: {
              where: {
                createdAt: { gte: startOfMonth },
              },
            },
          },
        },
      },
      orderBy: {
        reviews: {
          _count: "desc",
        },
      },
      take: 5,
    });

    return {
      period: "month",
      startDate: startOfMonth,
      endDate: now,
      metrics: {
        reviews: {
          count: thisMonthReviews,
          change: lastMonthReviews > 0
            ? ((thisMonthReviews - lastMonthReviews) / lastMonthReviews) * 100
            : 0,
        },
        favorites: {
          count: thisMonthFavorites,
          change: lastMonthFavorites > 0
            ? ((thisMonthFavorites - lastMonthFavorites) / lastMonthFavorites) * 100
            : 0,
        },
        activeUsers: {
          count: activeUsers,
          total: totalUsers,
          percentage: (activeUsers / totalUsers) * 100,
        },
      },
      topBooks: topBooksWithStats,
      topReviewers: topReviewers.map((reviewer) => ({
        id: reviewer.id,
        name: reviewer.name,
        image: reviewer.image,
        reviewCount: reviewer._count.reviews,
      })),
    };
  }),
});
