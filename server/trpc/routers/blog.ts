import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const blogRouter = router({
  // 公開されているブログ記事一覧を取得
  getPublished: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        cursor: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const posts = await prisma.blogPost.findMany({
        where: {
          isPublished: true,
          ...(input.category && { category: input.category }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          relatedBooks: {
            include: {
              book: true,
            },
            orderBy: { order: "asc" },
            take: 3,
          },
        },
        orderBy: { publishedAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
      });

      let nextCursor: string | undefined = undefined;
      if (posts.length > input.limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),

  // スラッグで記事を取得（閲覧数カウント）
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await prisma.blogPost.findUnique({
        where: { slug: input.slug, isPublished: true },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              bio: true,
            },
          },
          relatedBooks: {
            include: {
              book: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ブログ記事が見つかりません",
        });
      }

      // 閲覧数をインクリメント
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });

      return post;
    }),

  // カテゴリ一覧を取得
  getCategories: publicProcedure.query(async () => {
    const categories = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ["category"],
    });

    return categories.map((c) => c.category);
  }),

  // 人気記事を取得（閲覧数順）
  getPopular: publicProcedure
    .input(z.object({ limit: z.number().optional().default(5) }))
    .query(async ({ input }) => {
      const posts = await prisma.blogPost.findMany({
        where: { isPublished: true },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { viewCount: "desc" },
        take: input.limit,
      });

      return posts;
    }),

  // 関連記事を取得（同じカテゴリ）
  getRelated: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        limit: z.number().optional().default(3),
      })
    )
    .query(async ({ input }) => {
      const currentPost = await prisma.blogPost.findUnique({
        where: { slug: input.slug },
        select: { id: true, category: true },
      });

      if (!currentPost) {
        return [];
      }

      const posts = await prisma.blogPost.findMany({
        where: {
          isPublished: true,
          category: currentPost.category,
          id: { not: currentPost.id },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { publishedAt: "desc" },
        take: input.limit,
      });

      return posts;
    }),

  // 管理者用: 記事を作成
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().min(1),
        content: z.string().min(1),
        coverImage: z.string().optional(),
        category: z.string().min(1),
        tags: z.array(z.string()).default([]),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        isPublished: z.boolean().default(false),
        relatedBookIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const { relatedBookIds, ...postData } = input;

      const post = await prisma.blogPost.create({
        data: {
          ...postData,
          authorId: ctx.session.user.id,
          publishedAt: input.isPublished ? new Date() : null,
          ...(relatedBookIds &&
            relatedBookIds.length > 0 && {
              relatedBooks: {
                create: relatedBookIds.map((bookId, index) => ({
                  bookId,
                  order: index,
                })),
              },
            }),
        },
      });

      return post;
    }),

  // 管理者用: 記事を更新
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        excerpt: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        coverImage: z.string().optional(),
        category: z.string().min(1).optional(),
        tags: z.array(z.string()).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        isPublished: z.boolean().optional(),
        relatedBookIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const { id, relatedBookIds, ...updateData } = input;

      // 公開状態が変わる場合はpublishedAtを更新
      if (updateData.isPublished !== undefined) {
        const currentPost = await prisma.blogPost.findUnique({
          where: { id },
          select: { isPublished: true },
        });

        if (!currentPost?.isPublished && updateData.isPublished) {
          Object.assign(updateData, { publishedAt: new Date() });
        }
      }

      const post = await prisma.blogPost.update({
        where: { id },
        data: updateData,
      });

      // 関連書籍を更新
      if (relatedBookIds !== undefined) {
        // 既存の関連書籍を削除
        await prisma.blogPostBook.deleteMany({
          where: { blogPostId: id },
        });

        // 新しい関連書籍を追加
        if (relatedBookIds.length > 0) {
          await prisma.blogPostBook.createMany({
            data: relatedBookIds.map((bookId, index) => ({
              blogPostId: id,
              bookId,
              order: index,
            })),
          });
        }
      }

      return post;
    }),

  // 管理者用: 自分の記事一覧を取得
  getMyPosts: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "ログインが必要です",
      });
    }

    const posts = await prisma.blogPost.findMany({
      where: { authorId: ctx.session.user.id },
      include: {
        relatedBooks: {
          include: { book: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return posts;
  }),

  // 管理者用: IDで記事を取得（下書きも含む）
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      const post = await prisma.blogPost.findUnique({
        where: { id: input.id },
        include: {
          relatedBooks: {
            include: { book: true },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!post || post.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ブログ記事が見つかりません",
        });
      }

      return post;
    }),
});
