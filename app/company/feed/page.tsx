"use client";

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CompanyFeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: activities, isLoading: activitiesLoading } =
    trpc.discovery.getCompanyActivity.useQuery({ limit: 50 });
  const { data: popularBooks, isLoading: booksLoading } =
    trpc.discovery.getCompanyPopularBooks.useQuery({ limit: 10 });
  const { data: topReviewers, isLoading: reviewersLoading } =
    trpc.discovery.getCompanyTopReviewers.useQuery({ limit: 5 });
  const { data: company } = trpc.company.getCompanyInfo.useQuery();

  // 認証チェック
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">企業アカウントなし</h1>
          <p className="text-gray-600 mb-6">
            企業アカウントに所属していません。
          </p>
          <Link
            href="/company/register"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition"
          >
            企業アカウントを作成
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {company.name} - 社内フィード
        </h1>
        <p className="text-gray-600">
          企業メンバーの読書活動やおすすめの本を確認できます
        </p>
      </div>

      {/* ナビゲーションタブ */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex gap-8">
          <Link
            href="/company/dashboard"
            className="pb-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
          >
            ダッシュボード
          </Link>
          <Link
            href="/company/feed"
            className="pb-4 border-b-2 border-primary text-primary font-semibold"
          >
            社内フィード
          </Link>
          <Link
            href="/company/reports"
            className="pb-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
          >
            統計レポート
          </Link>
        </nav>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="md:col-span-2 space-y-8">
          {/* アクティビティフィード */}
          <div>
            <h2 className="text-2xl font-bold mb-4">最近のアクティビティ</h2>

            {activitiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="h-20 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : activities && activities.activities.length > 0 ? (
              <div className="space-y-4">
                {activities.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                  >
                    {/* ユーザー情報 */}
                    <div className="flex items-center gap-4 mb-4">
                      {activity.user.image ? (
                        <img
                          src={activity.user.image}
                          alt={activity.user.name || "User"}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          {activity.user.name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/profile/${activity.user.id}`}
                          className="font-semibold hover:text-primary transition"
                        >
                          {activity.user.name || "名前なし"}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {activity.type === "review"
                            ? "レビューを投稿"
                            : "お気に入りに追加"}{" "}
                          ・{" "}
                          {new Date(activity.createdAt).toLocaleDateString(
                            "ja-JP"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* 本の情報 */}
                    <Link
                      href={`/books/${activity.book.googleBooksId}`}
                      className="block"
                    >
                      <div className="flex gap-4">
                        {activity.book.coverImageUrl && (
                          <img
                            src={activity.book.coverImageUrl}
                            alt={activity.book.title}
                            className="w-16 h-24 object-cover rounded shadow"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg hover:text-primary transition">
                            {activity.book.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {activity.book.author}
                          </p>

                          {activity.type === "review" && (
                            <>
                              <div className="flex items-center gap-1 mt-2">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={
                                      i < activity.rating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                                {activity.content}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-600">まだアクティビティがありません</p>
              </div>
            )}
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-8">
          {/* 人気の本 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">社内で人気の本</h2>

            {booksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : popularBooks && popularBooks.length > 0 ? (
              <div className="space-y-4">
                {popularBooks.map((book, index) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.googleBooksId}`}
                    className="block hover:bg-gray-50 p-2 rounded transition"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl font-bold text-gray-400">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate hover:text-primary transition">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">
                          {book.author}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {book.companyReviewCount}件のレビュー
                          </span>
                          <span className="text-xs text-yellow-600">
                            ★{book.companyAverageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                データがありません
              </p>
            )}
          </div>

          {/* トップレビュアー */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">トップレビュアー</h2>

            {reviewersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-2 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topReviewers && topReviewers.length > 0 ? (
              <div className="space-y-3">
                {topReviewers.map((reviewer) => (
                  <Link
                    key={reviewer.id}
                    href={`/profile/${reviewer.id}`}
                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition"
                  >
                    {reviewer.image ? (
                      <img
                        src={reviewer.image}
                        alt={reviewer.name || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                        {reviewer.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {reviewer.name || "名前なし"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {reviewer._count.reviews}件のレビュー
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                データがありません
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
