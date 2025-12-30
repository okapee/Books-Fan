import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const notificationRouter = router({
  // 通知一覧を取得
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    const notifications = await prisma.notification.findMany({
      where: { receiverId: ctx.session.user.id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // 最新50件
    });

    return notifications;
  }),

  // 未読通知を取得
  getUnread: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: ctx.session.user.id,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return notifications;
  }),

  // 未読通知数を取得
  getUnreadCount: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      return 0;
    }

    const count = await prisma.notification.count({
      where: {
        receiverId: ctx.session.user.id,
        isRead: false,
      },
    });

    return count;
  }),

  // 通知を既読にする
  markAsRead: publicProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      // 通知の所有者確認
      const notification = await prisma.notification.findUnique({
        where: { id: input.notificationId },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "通知が見つかりません",
        });
      }

      if (notification.receiverId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "この通知にアクセスする権限がありません",
        });
      }

      await prisma.notification.update({
        where: { id: input.notificationId },
        data: { isRead: true },
      });

      return { success: true };
    }),

  // 全ての通知を既読にする
  markAllAsRead: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    await prisma.notification.updateMany({
      where: {
        receiverId: ctx.session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }),

  // 通知を削除
  delete: publicProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      // 通知の所有者確認
      const notification = await prisma.notification.findUnique({
        where: { id: input.notificationId },
      });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "通知が見つかりません",
        });
      }

      if (notification.receiverId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "この通知を削除する権限がありません",
        });
      }

      await prisma.notification.delete({
        where: { id: input.notificationId },
      });

      return { success: true };
    }),

  // 通知を作成（内部使用）
  create: publicProcedure
    .input(
      z.object({
        type: z.enum(["FOLLOW", "REVIEW_LIKE", "REVIEW_COMMENT"]),
        receiverId: z.string(),
        senderId: z.string().optional(),
        reviewId: z.string().optional(),
        commentId: z.string().optional(),
        bookGoogleId: z.string().optional(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const notification = await prisma.notification.create({
        data: {
          type: input.type,
          receiverId: input.receiverId,
          senderId: input.senderId,
          reviewId: input.reviewId,
          commentId: input.commentId,
          bookGoogleId: input.bookGoogleId,
          message: input.message,
        },
      });

      return notification;
    }),
});
