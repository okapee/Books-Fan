import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://books-fan.com";

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/books`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  try {
    // データベースから全ての本を取得（Google Books IDのみ）
    const books = await prisma.book.findMany({
      select: {
        googleBooksId: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5000, // サイトマップの上限を考慮
    });

    // 書籍詳細ページ
    const bookPages: MetadataRoute.Sitemap = books.map((book) => ({
      url: `${siteUrl}/books/${book.googleBooksId}`,
      lastModified: book.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // カテゴリページ（よく使われるカテゴリ）
    const categories = [
      "fiction",
      "business",
      "self-help",
      "technology",
      "science",
      "history",
      "biography",
      "philosophy",
    ];

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${siteUrl}/books/category/${category}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    }));

    // ブログ記事（公開済みのみ）
    const blogPosts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 1000,
    });

    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticPages, ...bookPages, ...categoryPages, ...blogPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // エラーが発生した場合は静的ページのみ返す
    return staticPages;
  }
}
