import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const followRouter = router({
  // ユーザーをフォロー
  follow: publicProcedure
    .input(z.object({ followingId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const followerId = ctx.session.user.id;

      // 自分自身をフォローできない
      if (followerId === input.followingId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "自分自身をフォローすることはできません",
        });
      }

      // フォローを作成（既存の場合は何もしない）
      const follow = await prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId,
            followingId: input.followingId,
          },
        },
        update: {},
        create: {
          followerId,
          followingId: input.followingId,
        },
      });

      // 新規作成された場合のみ通知を送る（createdAtを確認）
      const isNewFollow =
        new Date().getTime() - new Date(follow.createdAt).getTime() < 1000;

      // 新規フォローの場合のみ通知を作成
      if (isNewFollow) {
        // フォロワーの情報を取得
        const follower = await prisma.user.findUnique({
          where: { id: followerId },
          select: { name: true },
        });

        // 通知を作成
        await prisma.notification.create({
          data: {
            type: "FOLLOW",
            senderId: followerId,
            receiverId: input.followingId,
            message: `${follower?.name || "誰か"}があなたをフォローしました`,
          },
        });
      }

      return { success: true };
    }),

  // フォローを解除
  unfollow: publicProcedure
    .input(z.object({ followingId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 認証チェック
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      await prisma.follow.deleteMany({
        where: {
          followerId: ctx.session.user.id,
          followingId: input.followingId,
        },
      });

      return { success: true };
    }),

  // フォローしているかチェック
  isFollowing: publicProcedure
    .input(z.object({ followingId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        return { isFollowing: false };
      }

      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.session.user.id,
            followingId: input.followingId,
          },
        },
      });

      return { isFollowing: !!follow };
    }),

  // フォロワー数を取得
  getFollowerCount: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const count = await prisma.follow.count({
        where: { followingId: input.userId },
      });

      return count;
    }),

  // フォロー数を取得
  getFollowingCount: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const count = await prisma.follow.count({
        where: { followerId: input.userId },
      });

      return count;
    }),

  // フォロワー一覧を取得
  getFollowers: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const followers = await prisma.follow.findMany({
        where: { followingId: input.userId },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
              bio: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return followers.map((f) => f.follower);
    }),

  // フォロー中のユーザー一覧を取得
  getFollowing: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const following = await prisma.follow.findMany({
        where: { followerId: input.userId },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              image: true,
              bio: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return following.map((f) => f.following);
    }),
});
