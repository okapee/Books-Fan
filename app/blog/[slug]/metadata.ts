import { Metadata } from "next";

export async function generateBlogMetadata(slug: string): Promise<Metadata> {
  try {
    // Note: In a real implementation, you'd fetch this data server-side
    // For now, we'll return a basic structure
    return {
      title: `${slug} | Books Fan ブログ`,
      description: "Books Fanのブログ記事",
      openGraph: {
        title: `${slug} | Books Fan ブログ`,
        description: "Books Fanのブログ記事",
        type: "article",
        url: `https://booksfan.jp/blog/${slug}`,
        images: [
          {
            url: "/og-image.png",
            width: 1200,
            height: 630,
            alt: "Books Fan",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${slug} | Books Fan ブログ`,
        description: "Books Fanのブログ記事",
        images: ["/og-image.png"],
      },
    };
  } catch (error) {
    return {
      title: "ブログ | Books Fan",
      description: "本好きのためのレビュー＆推薦プラットフォーム",
    };
  }
}
