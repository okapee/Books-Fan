import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bookId = params.id;

  // Google Books APIから本の情報を取得
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${bookId}`
    );

    if (!response.ok) {
      return generateSEOMetadata({
        title: "本の詳細",
        url: `/books/${bookId}`,
      });
    }

    const data = await response.json();
    const volumeInfo = data.volumeInfo || {};

    const title = volumeInfo.title || "本の詳細";
    const author = volumeInfo.authors?.[0] || "著者不明";
    const description = volumeInfo.description
      ? volumeInfo.description.replace(/<[^>]*>/g, '').substring(0, 150) + "..."
      : `${author}著「${title}」の詳細ページ。レビューを読んだり、あなた自身のレビューを投稿できます。`;
    const image = volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium || volumeInfo.imageLinks?.thumbnail;

    return generateSEOMetadata({
      title: `${title} - ${author}`,
      description,
      image,
      url: `/books/${bookId}`,
      type: "article",
      keywords: ["本", "レビュー", "書評", title, author, "読書"],
    });
  } catch (error) {
    return generateSEOMetadata({
      title: "本の詳細",
      url: `/books/${bookId}`,
    });
  }
}

export default function BookLayout({ children }: Props) {
  return children;
}
