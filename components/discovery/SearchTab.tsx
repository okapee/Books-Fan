"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { BookCard } from "@/components/book/BookCard";
import { EmptyState } from "./EmptyState";

export function SearchTab() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults, isLoading } = trpc.book.search.useQuery(
    { query: searchQuery, maxResults: 20 },
    { enabled: searchQuery.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
      setSubmitted(true);
    }
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
              <div className="mb-6">
                <p className="text-gray-600">
                  <span className="font-semibold">
                    {searchResults.totalItems?.toLocaleString()}
                  </span>
                  件の結果
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
