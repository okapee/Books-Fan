import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  searchBooks,
  getBookById,
  searchBookByISBN,
  convertGoogleBookToBook,
} from "@/server/services/googleBooks";

export const bookRouter = router({
  // 本を検索（Google Books API）
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        maxResults: z.number().optional().default(20),
      })
    )
    .query(async ({ input }) => {
      const data = await searchBooks(input.query, input.maxResults);

      return {
        totalItems: data.totalItems,
        books: data.items?.map((volume) => ({
          id: volume.id,
          ...convertGoogleBookToBook(volume),
        })) || [],
      };
    }),

  // Google Books IDで本の詳細を取得
  getByGoogleId: publicProcedure
    .input(z.object({ googleBooksId: z.string() }))
    .query(async ({ input }) => {
      const volume = await getBookById(input.googleBooksId);

      return {
        id: volume.id,
        ...convertGoogleBookToBook(volume),
      };
    }),

  // ISBNで本を検索
  searchByISBN: publicProcedure
    .input(z.object({ isbn: z.string() }))
    .query(async ({ input }) => {
      const volume = await searchBookByISBN(input.isbn);

      if (!volume) {
        return null;
      }

      return {
        id: volume.id,
        ...convertGoogleBookToBook(volume),
      };
    }),

  // データベースから本を取得（内部ID）
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const book = await prisma.book.findUnique({
        where: { id: input.id },
        include: {
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          _count: {
            select: {
              reviews: true,
              favoriteBooks: true,
            },
          },
        },
      });

      return book;
    }),

  // 本をデータベースに保存または取得
  getOrCreate: publicProcedure
    .input(
      z.object({
        googleBooksId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // 既存の本をチェック
      let book = await prisma.book.findUnique({
        where: { googleBooksId: input.googleBooksId },
      });

      // 存在しない場合、Google Books APIから取得して保存
      if (!book) {
        const volume = await getBookById(input.googleBooksId);
        const bookData = convertGoogleBookToBook(volume);

        book = await prisma.book.create({
          data: bookData,
        });
      }

      return book;
    }),

  // 人気の本を取得（レビュー数順）
  getPopular: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }) => {
      const books = await prisma.book.findMany({
        where: {
          reviewCount: { gt: 0 }, // レビューが1件以上ある本のみ
        },
        orderBy: {
          reviewCount: "desc",
        },
        take: input.limit,
        include: {
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });

      return books;
    }),

  // 最近追加された本を取得
  getRecent: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }) => {
      const books = await prisma.book.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
        include: {
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });

      return books;
    }),
});
