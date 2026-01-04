"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { BookCard } from "@/components/book/BookCard";
import { EmptyState } from "./EmptyState";

const RESULTS_PER_PAGE = 20;

export function SearchTab() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;

  const { data: searchResults, isLoading } = trpc.book.search.useQuery(
    {
      query: searchQuery,
      maxResults: RESULTS_PER_PAGE,
      startIndex: startIndex
    },
    { enabled: searchQuery.length > 0 }
  );

  // 検索クエリが変わったらページを1にリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
      setSubmitted(true);
    }
  };

  const totalPages = searchResults?.totalItems
    ? Math.ceil(Math.min(searchResults.totalItems, 1000) / RESULTS_PER_PAGE) // Google Books APIは最大1000件まで
    : 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow + 2) {
      // 全ページを表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 省略表示
      if (currentPage <= 3) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div>
      {/* 検索フォーム */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="本のタイトル、著者名、ISBNで検索..."
              className="w-full px-6 py-4 pr-32 text-lg border-2 border-gray-300 rounded-full focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-8 py-2 rounded-full font-semibold hover:bg-primary-700 transition"
            >
              検索
            </button>
          </div>
        </form>
      </div>

      {/* 検索結果 */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && submitted && searchResults && (
        <>
          {searchResults.books && searchResults.books.length > 0 ? (
            <>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm sm:text-base text-gray-600">
                  <span className="font-semibold">
                    {searchResults.totalItems?.toLocaleString()}
                  </span>
                  件の結果
                  {totalPages > 1 && (
                    <span className="ml-2">
                      （ページ {currentPage} / {totalPages}）
                    </span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {searchResults.books.map((book: any) => (
                  <BookCard
                    key={book.id || book.googleBooksId}
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

              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 mt-8">
                  {/* 前へボタン */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ← 前へ
                  </button>

                  {/* ページ番号 */}
                  <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto justify-center">
                    {getPageNumbers().map((page, index) => (
                      <div key={index}>
                        {page === '...' ? (
                          <span className="px-2 py-2 text-gray-500 text-sm">...</span>
                        ) : (
                          <button
                            onClick={() => handlePageChange(page as number)}
                            className={`min-w-[2.5rem] px-3 py-2 text-sm font-medium rounded-lg transition ${
                              currentPage === page
                                ? 'bg-primary text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 次へボタン */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    次へ →
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon="🔍"
              title="検索結果が見つかりません"
              message={`「${searchQuery}」に一致する本が見つかりませんでした。別のキーワードで検索してみてください。`}
            />
          )}
        </>
      )}

      {!submitted && (
        <EmptyState
          icon="🔍"
          title="本を検索"
          message="タイトル、著者名、またはISBNを入力して本を探しましょう"
        />
      )}
    </div>
  );
}
