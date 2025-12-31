"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useEffect } from "react";
import { FollowButton } from "@/components/user/FollowButton";
import { UserStats } from "@/components/user/UserStats";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { data: session } = useSession();
  const router = useRouter();

  // 他のユーザー情報を取得
  const { data: user, isLoading } = trpc.user.getById.useQuery(
    { userId },
    { enabled: !!userId }
  );

  // そのユーザーのレビューを取得
  const { data: reviews, isLoading: reviewsLoading } = trpc.review.getByUserId.useQuery(
    { userId, limit: 10 },
    { enabled: !!userId }
  );

  // 自分のプロフィールの場合は /profile にリダイレクト
  useEffect(() => {
    if (session?.user?.id === userId) {
      router.push("/profile");
    }
  }, [session?.user?.id, userId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
            <div className="flex items-start gap-6">
              <div className="w-30 h-30 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ユーザーが見つかりません
            </h1>
            <p className="text-gray-600 mb-6">
              このユーザーは存在しないか、削除された可能性があります
            </p>
            <Link
              href="/books?tab=popular"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              本を探す
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary-200"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-primary text-white rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                    {user.name || "匿名ユーザー"}
                  </h1>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    登録日: {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                {/* フォローボタン */}
                {session && (
                  <div className="flex justify-center sm:justify-start">
                    <FollowButton userId={userId} />
                  </div>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-700 mb-4 whitespace-pre-line">
                  {user.bio}
                </p>
              )}

              {/* Stats */}
              <UserStats userId={userId} />
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6">
            最近のレビュー
          </h2>

          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/books/${review.book.googleBooksId}`}
                  className="block border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition"
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Book Cover */}
                    {review.book.coverImageUrl && (
                      <img
                        src={review.book.coverImageUrl}
                        alt={review.book.title}
                        className="w-14 h-20 sm:w-16 sm:h-24 rounded object-cover flex-shrink-0"
                      />
                    )}

                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 line-clamp-1">
                        {review.book.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {review.book.author}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < review.rating
                                  ? "text-accent"
                                  : "text-gray-300"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>

                      {/* Review Text */}
                      <p className="text-gray-700 line-clamp-2">
                        {review.content}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}

              {reviews.length >= 10 && (
                <div className="text-center pt-4">
                  <p className="text-gray-600 text-sm">
                    さらに多くのレビューを見るには、本のページをご覧ください
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500">まだレビューがありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
