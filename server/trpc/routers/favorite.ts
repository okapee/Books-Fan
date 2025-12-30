import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const favoriteRouter = router({
  // お気に入りに追加
  add: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      // 既存のお気に入りをチェック
      const existing = await prisma.favoriteBook.findUnique({
        where: {
          userId_bookId: {
            userId: ctx.session.user.id,
            bookId: input.bookId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "既にお気に入りに追加されています",
        });
      }

      // お気に入りを追加
      const favorite = await prisma.favoriteBook.create({
        data: {
          userId: ctx.session.user.id,
          bookId: input.bookId,
        },
        include: {
          book: true,
        },
      });

      return favorite;
    }),

  // お気に入りから削除
  remove: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      await prisma.favoriteBook.delete({
        where: {
          userId_bookId: {
            userId: ctx.session.user.id,
            bookId: input.bookId,
          },
        },
      });

      return { success: true };
    }),

  // お気に入り状態を確認
  check: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        return { isFavorite: false };
      }

      const favorite = await prisma.favoriteBook.findUnique({
        where: {
          userId_bookId: {
            userId: ctx.session.user.id,
            bookId: input.bookId,
          },
        },
      });

      return { isFavorite: !!favorite };
    }),

  // ユーザーのお気に入り一覧を取得
  getByUserId: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    const favorites = await prisma.favoriteBook.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        book: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return favorites;
  }),
});
