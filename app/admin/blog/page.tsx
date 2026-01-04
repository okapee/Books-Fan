"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export default function AdminBlogPage() {
  const router = useRouter();
  const { data: posts, isLoading } = trpc.blog.getMyPosts.useQuery();
  const deleteMutation = trpc.blog.update.useMutation();

  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const filteredPosts = posts?.filter((post) => {
    if (filter === "published") return post.isPublished;
    if (filter === "draft") return !post.isPublished;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;

    // Note: We should add a delete endpoint in the blog router
    // For now, we'll unpublish it
    await deleteMutation.mutateAsync({
      id,
      isPublished: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
              ブログ管理
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              記事の作成・編集・管理
            </p>
          </div>
          <Link
            href="/admin/blog/new"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg font-bold hover:shadow-xl transition text-center"
          >
            ＋ 新規記事作成
          </Link>
        </div>

        {/* フィルター */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              すべて ({posts?.length || 0})
            </button>
            <button
              onClick={() => setFilter("published")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "published"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              公開中 ({posts?.filter((p) => p.isPublished).length || 0})
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "draft"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              下書き ({posts?.filter((p) => !p.isPublished).length || 0})
            </button>
          </div>
        </div>

        {/* 記事一覧 */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow h-32 animate-pulse"
              />
            ))}
          </div>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* カバー画像 */}
                  {post.coverImage && (
                    <div className="w-full sm:w-32 h-32 flex-shrink-0">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* 記事情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                              post.isPublished
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {post.isPublished ? "公開中" : "下書き"}
                          </span>
                          <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                            {post.category}
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                          {post.title}
                        </h2>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* メタ情報 */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {post.viewCount.toLocaleString()} views
                      </div>
                      {post.publishedAt && (
                        <span>
                          公開:{" "}
                          {formatDistanceToNow(new Date(post.publishedAt), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </span>
                      )}
                      <span>
                        更新:{" "}
                        {formatDistanceToNow(new Date(post.updatedAt), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </span>
                      {post.relatedBooks.length > 0 && (
                        <span>📚 関連書籍 {post.relatedBooks.length}冊</span>
                      )}
                    </div>

                    {/* アクションボタン */}
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {post.isPublished && (
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                          target="_blank"
                        >
                          プレビュー →
                        </Link>
                      )}
                      <Link
                        href={`/admin/blog/edit/${post.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl">
            <div className="text-5xl sm:text-6xl mb-4">📝</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              記事がありません
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              新しい記事を作成して、読者に情報を届けましょう
            </p>
            <Link
              href="/admin/blog/new"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-xl transition"
            >
              ＋ 新規記事作成
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
