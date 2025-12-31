import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const readingRouter = router({
  // ============================================
  // 読書ステータス管理
  // ============================================

  // ステータスを設定/更新
  setStatus: publicProcedure
    .input(
      z.object({
        bookId: z.string(),
        status: z.enum(["WANT_TO_READ", "READING", "COMPLETED"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const now = new Date();

      // 既存のステータスを確認
      const existing = await prisma.readingStatus.findUnique({
        where: {
          userId_bookId: {
            userId: ctx.session.user.id,
            bookId: input.bookId,
          },
        },
      });

      let readingStatus;

      if (existing) {
        // 更新
        const updateData: any = {
          status: input.status,
        };

        // ステータス遷移に応じてタイムスタンプを設定
        if (input.status === "READING" && existing.status !== "READING") {
          updateData.startedAt = now;
        }

        if (input.status === "COMPLETED" && existing.status !== "COMPLETED") {
          updateData.completedAt = now;
        }

        readingStatus = await prisma.readingStatus.update({
          where: { id: existing.id },
          data: updateData,
          include: { book: true },
        });
      } else {
        // 新規作成
        const createData: any = {
          userId: ctx.session.user.id,
          bookId: input.bookId,
          status: input.status,
        };

        if (input.status === "READING") {
          createData.startedAt = now;
        } else if (input.status === "COMPLETED") {
          createData.completedAt = now;
        }

        readingStatus = await prisma.readingStatus.create({
          data: createData,
          include: { book: true },
        });
      }

      return readingStatus;
    }),

  // ステータスを削除
  removeStatus: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      await prisma.readingStatus.delete({
        where: {
          userId_bookId: {
            userId: ctx.session.user.id,
            bookId: input.bookId,
          },
        },
      });

      return { success: true };
    }),

  // ステータスを取得
  getStatus: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        return { status: null };
      }

      const readingStatus = await prisma.readingStatus.findUnique({
        where: {
          userId_bookId: {
            userId: ctx.session.user.id,
            bookId: input.bookId,
          },
        },
      });

      return { status: readingStatus?.status || null };
    }),

  // ステータス別に書籍を取得
  getByStatus: publicProcedure
    .input(
      z.object({
        status: z.enum(["WANT_TO_READ", "READING", "COMPLETED"]),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const statuses = await prisma.readingStatus.findMany({
        where: {
          userId: ctx.session.user.id,
          status: input.status,
        },
        include: {
          book: true,
          sessions: {
            where: { isCompleted: true },
            select: { duration: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: input.limit,
      });

      // 各書籍の合計読書時間を計算
      const booksWithStats = statuses.map((status) => ({
        ...status,
        totalReadingTime: status.sessions.reduce(
          (sum, session) => sum + session.duration,
          0
        ),
      }));

      return { books: booksWithStats };
    }),

  // ============================================
  // 読書セッション（ポモドーロ）
  // ============================================

  // セッションを開始
  startSession: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      // 読書ステータスが存在しREADINGであることを確認
      const readingStatus = await prisma.readingStatus.findUnique({
        where: {
          userId_bookId: {
            userId: ctx.session.user.id,
            bookId: input.bookId,
          },
        },
      });

      if (!readingStatus) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "読書ステータスが設定されていません",
        });
      }

      if (readingStatus.status !== "READING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "読書中ステータスに設定してください",
        });
      }

      // セッションを作成（未完了）
      const session = await prisma.readingSession.create({
        data: {
          userId: ctx.session.user.id,
          bookId: input.bookId,
          readingStatusId: readingStatus.id,
          startedAt: new Date(),
          duration: 1500, // 25分（秒単位）
          isCompleted: false,
        },
      });

      return session;
    }),

  // セッションを完了
  completeSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        actualDuration: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const session = await prisma.readingSession.findUnique({
        where: { id: input.sessionId },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "セッションが見つかりません",
        });
      }

      if (session.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "権限がありません",
        });
      }

      // 完了としてマーク
      const updated = await prisma.readingSession.update({
        where: { id: input.sessionId },
        data: {
          completedAt: new Date(),
          isCompleted: true,
          duration: input.actualDuration || session.duration,
        },
      });

      return updated;
    }),

  // 書籍のセッション履歴を取得
  getSessions: publicProcedure
    .input(
      z.object({
        bookId: z.string(),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const sessions = await prisma.readingSession.findMany({
        where: {
          userId: ctx.session.user.id,
          bookId: input.bookId,
          isCompleted: true,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      // 合計時間を計算
      const totalDuration = sessions.reduce(
        (sum, session) => sum + session.duration,
        0
      );

      return {
        sessions,
        totalDuration,
        sessionCount: sessions.length,
      };
    }),

  // ユーザーの全セッション取得
  getUserSessions: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const sessions = await prisma.readingSession.findMany({
        where: {
          userId: ctx.session.user.id,
          isCompleted: true,
        },
        include: {
          book: true,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      return { sessions };
    }),

  // 読書統計を取得
  getStats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    const userId = ctx.session.user.id;

    // ステータス別の冊数を集計
    const statusCounts = await prisma.readingStatus.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    });

    // 合計読書時間とセッション数
    const sessions = await prisma.readingSession.aggregate({
      where: {
        userId,
        isCompleted: true,
      },
      _sum: { duration: true },
      _count: true,
    });

    // 過去30日間の読書日数
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentSessions = await prisma.readingSession.findMany({
      where: {
        userId,
        isCompleted: true,
        createdAt: { gte: last30Days },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const readingDays = new Set(
      recentSessions.map((s) => s.createdAt.toISOString().split("T")[0])
    );

    return {
      wantToRead:
        statusCounts.find((s) => s.status === "WANT_TO_READ")?._count || 0,
      reading: statusCounts.find((s) => s.status === "READING")?._count || 0,
      completed:
        statusCounts.find((s) => s.status === "COMPLETED")?._count || 0,
      totalReadingTime: sessions._sum.duration || 0,
      totalSessions: sessions._count || 0,
      readingDaysLast30: readingDays.size,
    };
  }),
});
