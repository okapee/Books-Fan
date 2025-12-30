"use client";

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function FavoritesPage() {
  const { data: session } = useSession();

  // HTMLタグを削除する関数
  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  // お気に入り一覧を取得
  const {
    data: favorites,
    isLoading,
    refetch,
  } = trpc.favorite.getByUserId.useQuery(undefined, {
    enabled: !!session,
  });

  // お気に入りから削除
  const removeFavorite = trpc.favorite.remove.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleRemove = (bookId: string, bookTitle: string) => {
    if (confirm(`「${bookTitle}」をお気に入りから削除しますか？`)) {
      removeFavorite.mutate({ bookId });
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">
              ログインが必要です
            </p>
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
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
              >
                <div className="w-full h-64 bg-gray-200 rounded mb-4" />
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-primary">
            お気に入りの本
          </h1>
          <Link
            href="/books"
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            本を探す
          </Link>
        </div>

        {/* Favorites Count */}
        {favorites && favorites.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              {favorites.length} 冊のお気に入り
            </p>
          </div>
        )}

        {/* Empty State */}
        {favorites && favorites.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              お気に入りの本がありません
            </h2>
            <p className="text-gray-600 mb-6">
              気に入った本を見つけたら、お気に入りに追加してみましょう
            </p>
            <Link
              href="/books"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              本を探す
            </Link>
          </div>
        )}

        {/* Favorites Grid */}
        {favorites && favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group"
              >
                <Link
                  href={`/books/${favorite.book.googleBooksId || favorite.book.id}`}
                >
                  {/* Book Cover */}
                  <div className="relative h-64 bg-gray-100">
                    {favorite.book.coverImageUrl ? (
                      <img
                        src={favorite.book.coverImageUrl}
                        alt={favorite.book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">📚</span>
                      </div>
                    )}
                    {/* Favorite Badge */}
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      ❤️ お気に入り
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2 group-hover:text-primary-700 transition">
                      {favorite.book.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-1">
                      {favorite.book.author}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {favorite.book.averageRating && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{favorite.book.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span>📝</span>
                        <span>{favorite.book.reviewCount} レビュー</span>
                      </div>
                    </div>

                    {/* Description */}
                    {favorite.book.description && (
                      <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                        {stripHtmlTags(favorite.book.description)}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-2">
                  <Link
                    href={`/books/${favorite.book.googleBooksId || favorite.book.id}`}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition text-center text-sm"
                  >
                    詳細を見る
                  </Link>
                  <button
                    onClick={() =>
                      handleRemove(favorite.book.id, favorite.book.title)
                    }
                    disabled={removeFavorite.isPending}
                    className="border-2 border-red-500 text-red-500 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition disabled:opacity-50 text-sm"
                  >
                    削除
                  </button>
                </div>

                {/* Added Date */}
                <div className="px-6 pb-4 text-xs text-gray-500">
                  {new Date(favorite.createdAt).toLocaleDateString("ja-JP")} に追加
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
