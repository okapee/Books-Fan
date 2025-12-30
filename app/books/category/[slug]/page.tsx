"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { BookCard } from "@/components/book/BookCard";
import { EmptyState } from "@/components/discovery/EmptyState";

type SortOption = "popular" | "rating" | "recent" | "trending";

export default function CategoryPage() {
  const params = useParams();
  const category = decodeURIComponent(params.slug as string);
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  const { data, isLoading } = trpc.discovery.getByCategory.useQuery({
    category,
    sortBy,
    limit: 24,
  });

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "popular", label: "人気順" },
    { value: "rating", label: "評価順" },
    { value: "recent", label: "新着順" },
    { value: "trending", label: "トレンド" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link href="/books" className="hover:text-primary">
                本を探す
              </Link>
            </li>
            <li>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li>
              <Link
                href="/books?tab=categories"
                className="hover:text-primary"
              >
                カテゴリ
              </Link>
            </li>
            <li>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li className="font-semibold text-primary">{category}</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              {category}
            </h1>
            {data && data.books.length > 0 && (
              <p className="text-gray-600">
                {data.books.length}冊の本を表示中
              </p>
            )}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">並び替え:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-xl" />
            ))}
          </div>
        ) : data && data.books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.books.map((book: any) => (
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
        ) : (
          <EmptyState
            icon="🔍"
            title="本が見つかりません"
            message={`「${category}」カテゴリに本が見つかりませんでした`}
            actionLabel="カテゴリ一覧へ"
            actionHref="/books?tab=categories"
          />
        )}
      </div>
    </div>
  );
}
