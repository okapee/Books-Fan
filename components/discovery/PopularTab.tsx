"use client";

import { trpc } from "@/lib/trpc";
import { BookCard } from "@/components/book/BookCard";
import { EmptyState } from "./EmptyState";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export function PopularTab() {
  const { data: highestRated, isLoading: ratedLoading } =
    trpc.discovery.getHighestRated.useQuery({ minReviewCount: 5, limit: 12 });

  const { data: trending, isLoading: trendingLoading } =
    trpc.discovery.getTrending.useQuery({ daysRange: 30, limit: 12 });

  const { data: popular, isLoading: popularLoading } =
    trpc.book.getPopular.useQuery({ limit: 12 });

  if (ratedLoading || trendingLoading || popularLoading) {
    return (
      <div className="space-y-12">
        {[1, 2, 3].map((section) => (
          <div key={section}>
            <div className="mb-6">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* トレンド本 */}
      {trending && trending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">トレンド</h2>
              <p className="text-gray-600 mt-1">最近人気急上昇中の本</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((book: any) => (
              <div key={book.id} className="relative">
                <BookCard
                  id={book.id}
                  googleBooksId={book.googleBooksId}
                  title={book.title}
                  author={book.author}
                  coverImageUrl={book.coverImageUrl}
                  averageRating={book.averageRating}
                  reviewCount={book.reviewCount}
                  description={book.description}
                />
                {book.activityCount > 5 && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg z-10">
                    🔥 HOT
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 最高評価 */}
      {highestRated && highestRated.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">最高評価</h2>
              <p className="text-gray-600 mt-1">ユーザーから高く評価されている本</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highestRated.map((book: any) => (
              <BookCard
                key={book.id}
                id={book.id}
                googleBooksId={book.googleBooksId}
                title={book.title}
                author={book.author}
                coverImageUrl={book.coverImageUrl}
                averageRating={book.averageRating}
                reviewCount={book.reviewCount}
                description={book.description}
              />
            ))}
          </div>
        </section>
      )}

      {/* 人気の本 */}
      {popular && popular.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                みんなの人気
              </h2>
              <p className="text-gray-600 mt-1">多くのレビューが投稿されている本</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popular.map((book: any) => (
              <BookCard
                key={book.id}
                id={book.id}
                googleBooksId={book.googleBooksId}
                title={book.title}
                author={book.author}
                coverImageUrl={book.coverImageUrl}
                averageRating={book.averageRating}
                reviewCount={book.reviewCount}
                description={book.description}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
