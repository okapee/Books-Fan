import { Metadata } from "next";
import { generateBookReviewMetadata } from "@/lib/seo";
import { db } from "@/server/db";

type Props = {
  params: { id: string; reviewId: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: bookId, reviewId } = params;

  try {
    // レビューをデータベースから取得
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!review) {
      return {
        title: "レビューが見つかりません | Books Fan",
      };
    }

    // Google Books APIから本の情報を取得
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${bookId}`
    );

    if (!response.ok) {
      return {
        title: "レビュー詳細 | Books Fan",
      };
    }

    const data = await response.json();
    const volumeInfo = data.volumeInfo || {};

    const bookTitle = volumeInfo.title || "書籍";
    const bookAuthor = volumeInfo.authors?.[0] || "著者不明";
    const reviewExcerpt = review.content.substring(0, 100);
    const bookImage = volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium || volumeInfo.imageLinks?.thumbnail;

    return generateBookReviewMetadata(
      bookTitle,
      bookAuthor,
      reviewExcerpt,
      review.rating,
      bookImage
    );
  } catch (error) {
    return {
      title: "レビュー詳細 | Books Fan",
    };
  }
}

export default function ReviewLayout({ children }: Props) {
  return children;
}
