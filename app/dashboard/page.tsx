"use client";

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();

  // ユーザー情報を取得
  const { data: user, isLoading: userLoading } = trpc.user.getCurrent.useQuery(
    undefined,
    { enabled: !!session }
  );

  // 統計情報を取得
  const { data: stats, isLoading: statsLoading } = trpc.user.getStats.useQuery(
    undefined,
    { enabled: !!session }
  );

  // お気に入りを取得（最新3件）
  const { data: favorites, isLoading: favoritesLoading } =
    trpc.favorite.getByUserId.useQuery(undefined, {
      enabled: !!session,
    });

  const isLoading = userLoading || statsLoading || favoritesLoading;

  // AI使用制限の計算
  const aiLimit = user?.membershipType === "PREMIUM" ? 30 : 0;
  const aiUsagePercentage =
    aiLimit > 0 && user?.aiUsageCount
      ? (user.aiUsageCount / aiLimit) * 100
      : 0;

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">ログインが必要です</p>
            <Link href="/" className="text-primary hover:underline">
              トップページへ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const recentFavorites = favorites?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            ようこそ、{user?.name}さん
          </h1>
          <p className="text-gray-600">
            今日も素敵な本との出会いを楽しみましょう
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Reviews */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📝</div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {stats?.reviewCount || 0}
                </p>
                <p className="text-sm text-gray-600">レビュー</p>
              </div>
            </div>
            <Link
              href="/profile"
              className="text-primary hover:underline text-sm font-semibold"
            >
              すべて見る →
            </Link>
          </div>

          {/* Favorites */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">❤️</div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {stats?.favoriteCount || 0}
                </p>
                <p className="text-sm text-gray-600">お気に入り</p>
              </div>
            </div>
            <Link
              href="/favorites"
              className="text-primary hover:underline text-sm font-semibold"
            >
              すべて見る →
            </Link>
          </div>

          {/* AI Summaries */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🤖</div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {stats?.aiSummaryCount || 0}
                </p>
                <p className="text-sm text-gray-600">AI要約</p>
              </div>
            </div>
            {user?.membershipType === "FREE" ? (
              <Link
                href="/upgrade"
                className="text-purple-600 hover:underline text-sm font-semibold"
              >
                プレミアムで利用 →
              </Link>
            ) : (
              <p className="text-sm text-gray-600">
                残り {aiLimit - (user?.aiUsageCount || 0)} 回
              </p>
            )}
          </div>
        </div>

        {/* AI Usage Card (Premium users) */}
        {user?.membershipType === "PREMIUM" && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-primary mb-1">
                  AI使用状況
                </h2>
                <p className="text-sm text-gray-600">今月の使用回数</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-700">
                  {user?.aiUsageCount || 0} / {aiLimit}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  aiUsagePercentage >= 90
                    ? "bg-red-500"
                    : aiUsagePercentage >= 70
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(aiUsagePercentage, 100)}%` }}
              />
            </div>
            {aiUsagePercentage >= 90 && (
              <p className="text-xs text-red-600 mt-2">
                残りわずかです。来月1日にリセットされます。
              </p>
            )}
          </div>
        )}

        {/* Premium Upgrade Banner (Free users) */}
        {user?.membershipType === "FREE" && (
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  プレミアムで読書体験をアップグレード
                </h2>
                <p className="text-purple-100">
                  AI要約機能で、レビューの要点を自動抽出。月30回まで使えます。
                </p>
              </div>
              <Link
                href="/upgrade"
                className="bg-yellow-400 text-purple-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition shadow-lg whitespace-nowrap"
              >
                詳しく見る
              </Link>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Recent Favorites */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">
                最近のお気に入り
              </h2>
              <Link
                href="/favorites"
                className="text-primary hover:underline text-sm font-semibold"
              >
                すべて見る →
              </Link>
            </div>

            {recentFavorites.length > 0 ? (
              <div className="space-y-4">
                {recentFavorites.map((favorite) => (
                  <Link
                    key={favorite.id}
                    href={`/books/${favorite.book.googleBooksId || favorite.book.id}`}
                    className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    {favorite.book.coverImageUrl ? (
                      <img
                        src={favorite.book.coverImageUrl}
                        alt={favorite.book.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center text-2xl">
                        📚
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-primary line-clamp-2 mb-1">
                        {favorite.book.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {favorite.book.author}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(favorite.createdAt).toLocaleDateString(
                          "ja-JP"
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-3">
                  まだお気に入りがありません
                </p>
                <Link
                  href="/books"
                  className="text-primary hover:underline text-sm font-semibold"
                >
                  本を探す
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-6">
              クイックアクション
            </h2>
            <div className="space-y-3">
              <Link
                href="/books"
                className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary-50 transition"
              >
                <span className="text-3xl">🔍</span>
                <div>
                  <p className="font-semibold text-gray-900">本を探す</p>
                  <p className="text-sm text-gray-600">
                    新しい本を検索してレビューを書く
                  </p>
                </div>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary-50 transition"
              >
                <span className="text-3xl">👤</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    プロフィール
                  </p>
                  <p className="text-sm text-gray-600">
                    プロフィールとレビューを確認
                  </p>
                </div>
              </Link>

              <Link
                href="/favorites"
                className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary-50 transition"
              >
                <span className="text-3xl">❤️</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    お気に入り
                  </p>
                  <p className="text-sm text-gray-600">
                    お気に入りの本を見る
                  </p>
                </div>
              </Link>

              {user?.membershipType === "FREE" && (
                <Link
                  href="/upgrade"
                  className="flex items-center gap-4 p-4 border-2 border-purple-200 bg-purple-50 rounded-lg hover:border-purple-400 hover:bg-purple-100 transition"
                >
                  <span className="text-3xl">⭐</span>
                  <div>
                    <p className="font-semibold text-purple-900">
                      プレミアムにアップグレード
                    </p>
                    <p className="text-sm text-purple-700">
                      AI要約機能を使えるようになります
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">ヒント</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>
                  • 本を読み終えたら、感想をレビューとして残しましょう
                </li>
                <li>
                  • お気に入り機能で、読みたい本や印象的だった本をブックマーク
                </li>
                {user?.membershipType === "PREMIUM" && (
                  <li>
                    • AI要約機能で、レビューの要点を自動的に抽出できます
                  </li>
                )}
                <li>
                  • プロフィールページで自分のレビュー履歴を確認できます
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
