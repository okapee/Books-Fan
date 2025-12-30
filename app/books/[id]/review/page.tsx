"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { ReviewForm } from "@/components/book/ReviewForm";
import Link from "next/link";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  const { data: session, status } = useSession();

  // Get book details
  const { data: book, isLoading } = trpc.book.getByGoogleId.useQuery({
    googleBooksId: bookId,
  });

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">
              ログインが必要です
            </h1>
            <p className="text-gray-600 mb-6">
              レビューを投稿するにはログインが必要です
            </p>
            <Link
              href="/"
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition inline-block"
            >
              ログインする
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-12 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-32 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">
              本が見つかりませんでした
            </p>
            <Link href="/books" className="text-primary hover:underline">
              本を検索する
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-4">
              レビューを書く
            </h1>

            {/* Book Info */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-16 h-24 rounded shadow-sm object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">📚</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-gray-900 line-clamp-2">
                  {book.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{book.author}</p>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <ReviewForm googleBooksId={bookId} />
        </div>
      </div>
    </div>
  );
}
