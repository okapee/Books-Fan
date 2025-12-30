"use client";

import { trpc } from "@/lib/trpc";
import { BookCard } from "@/components/book/BookCard";
import { ActivityCard } from "./ActivityCard";
import { EmptyState } from "./EmptyState";

export function FollowingTab() {
  const { data: followingBooks, isLoading: booksLoading } =
    trpc.discovery.getFollowingBooks.useQuery({ limit: 20 });

  const { data: activity, isLoading: activityLoading } =
    trpc.discovery.getFollowingActivity.useQuery({ limit: 10 });

  const { data: trending, isLoading: trendingLoading } =
    trpc.discovery.getFollowingTrending.useQuery({ daysRange: 30, limit: 6 });

  if (booksLoading || activityLoading || trendingLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // フォローなし、または活動なしの場合
  if (
    (!followingBooks || followingBooks.books.length === 0) &&
    (!activity || activity.activities.length === 0) &&
    (!trending || trending.length === 0)
  ) {
    return (
      <EmptyState
        icon="👥"
        title="フォロー中のユーザーがいません"
        message="ユーザーをフォローして、その人のおすすめ本を見つけましょう"
        actionLabel="人気の本を見る"
        onAction={() => {
          // タブ切り替え処理（親コンポーネントで実装）
        }}
      />
    );
  }

  return (
    <div className="space-y-12">
      {/* フォロワー間でトレンドの本 */}
      {trending && trending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              フォロー中で人気
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((book: any) => (
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

      {/* フォロー中のユーザーがレビューした本 */}
      {followingBooks && followingBooks.books.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              フォロー中のユーザーがレビュー
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followingBooks.books.map((book: any) => (
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
                reviewedBy={book.reviewedBy}
                userRating={book.rating}
              />
            ))}
          </div>
        </section>
      )}

      {/* アクティビティフィード */}
      {activity && activity.activities.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">最近の活動</h2>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {activity.activities.map((act: any) => (
              <ActivityCard key={act.id} activity={act} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
