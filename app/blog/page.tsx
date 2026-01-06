"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { BlogCard } from "@/components/blog/BlogCard";
import Link from "next/link";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.blog.getPublished.useInfiniteQuery(
      { limit: 12, category: selectedCategory },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const { data: categories } = trpc.blog.getCategories.useQuery();
  const { data: popularPosts } = trpc.blog.getPopular.useQuery({ limit: 5 });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4">
            📖 Books Fan ブログ
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            読書術、学習法、おすすめの本など、本にまつわる情報をお届けします
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1 min-w-0">
            {/* カテゴリフィルター */}
            {categories && categories.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() => setSelectedCategory(undefined)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                      selectedCategory === undefined
                        ? "bg-purple-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    すべて
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                        selectedCategory === category
                          ? "bg-purple-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ブログ記事一覧 */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-lg h-96 animate-pulse"
                  />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <>
                {/* 記事数表示 */}
                <div className="mb-6 text-sm text-gray-600">
                  {posts.length}件の記事を表示中
                  {hasNextPage && " （さらに記事があります）"}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {posts.map((post: any) => (
                    <BlogCard
                      key={post.id}
                      slug={post.slug}
                      title={post.title}
                      excerpt={post.excerpt}
                      coverImage={post.coverImage}
                      category={post.category}
                      publishedAt={post.publishedAt}
                      author={post.author}
                      viewCount={post.viewCount}
                    />
                  ))}
                </div>

                {/* もっと読む */}
                {hasNextPage && (
                  <div className="text-center py-8">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isFetchingNextPage ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          読み込み中...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 justify-center">
                          もっと読む
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      )}
                    </button>
                    <p className="text-sm text-gray-500 mt-3">
                      さらに記事を読み込む
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl">
                <div className="text-5xl sm:text-6xl mb-4">📚</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  記事がありません
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {selectedCategory
                    ? "このカテゴリの記事はまだありません"
                    : "記事はまだ投稿されていません"}
                </p>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <aside className="lg:w-80 space-y-6">
            {/* Books Fanへのリンク */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                📖 本を探す
              </h3>
              <p className="text-sm mb-4">
                Books Fanで気になる本を見つけて、レビューをチェックしよう！
              </p>
              <Link
                href="/books"
                className="block w-full bg-white text-purple-600 text-center px-4 py-2.5 sm:py-3 rounded-lg font-bold hover:shadow-lg transition"
              >
                本を探す →
              </Link>
            </div>

            {/* 人気記事 */}
            {popularPosts && popularPosts.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  🔥 人気記事
                </h3>
                <div className="space-y-4">
                  {popularPosts.map((post: any, index: number) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {post.viewCount.toLocaleString()} views
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
