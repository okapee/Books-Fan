"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { BookCard } from "@/components/book/BookCard";
import Link from "next/link";

export function RecommendationsSidebar() {
  const { data: session } = useSession();

  const { data: fromReviews, isLoading: reviewsLoading } =
    trpc.discovery.getRecommendationsFromReviews.useQuery(
      { limit: 4 },
      { enabled: !!session }
    );

  const { data: fromReaders, isLoading: readersLoading } =
    trpc.discovery.getSimilarReaderRecommendations.useQuery(
      { limit: 4 },
      { enabled: !!session }
    );

  // ログインしていない場合は表示しない
  if (!session) {
    return null;
  }

  // データがない場合は表示しない
  if (
    (!fromReviews || fromReviews.length === 0) &&
    (!fromReaders || fromReaders.length === 0)
  ) {
    return null;
  }

  return (
    <div className="hidden xl:block w-80 flex-shrink-0">
      <div className="sticky top-8 space-y-6">
        {/* あなたへのおすすめ */}
        {fromReviews && fromReviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                あなたへのおすすめ
              </h3>
              <span className="text-xs text-gray-500">レビュー履歴から</span>
            </div>

            <div className="space-y-4">
              {fromReviews.slice(0, 3).map((book: any) => (
                <Link
                  key={book.id}
                  href={`/books/${book.googleBooksId || book.id}`}
                  className="block group"
                >
                  <div className="flex gap-3">
                    {book.coverImageUrl && (
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded shadow-sm group-hover:shadow-md transition"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-primary transition">
                        {book.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {book.author}
                      </p>
                      {book.averageRating && book.averageRating > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.round(book.averageRating)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {book.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 類似読者のおすすめ */}
        {fromReaders && fromReaders.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                類似読者のおすすめ
              </h3>
              <span className="text-xs text-gray-500">同じ本を読んだ人</span>
            </div>

            <div className="space-y-4">
              {fromReaders.slice(0, 3).map((book: any) => (
                <Link
                  key={book.id}
                  href={`/books/${book.googleBooksId || book.id}`}
                  className="block group"
                >
                  <div className="flex gap-3">
                    {book.coverImageUrl && (
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded shadow-sm group-hover:shadow-md transition"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-primary transition">
                        {book.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {book.author}
                      </p>
                      {book.averageRating && book.averageRating > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.round(book.averageRating)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {book.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-br from-primary to-primary-700 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-2">💡 ヒント</h3>
          <p className="text-sm opacity-90">
            より多くの本をレビューすると、あなたの好みに合ったおすすめが表示されるようになります。
          </p>
        </div>
      </div>
    </div>
  );
}
