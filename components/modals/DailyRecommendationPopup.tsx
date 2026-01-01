"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

interface DailyRecommendationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: Array<{
    id: string;
    googleBooksId: string;
    title: string;
    author: string | null;
    coverImageUrl: string | null;
    description: string | null;
    categories: string[];
    averageRating: number;
    reviewCount: number;
  }>;
}

export function DailyRecommendationPopup({
  isOpen,
  onClose,
  recommendations,
}: DailyRecommendationPopupProps) {
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set());

  const setStatusMutation = trpc.reading.setStatus.useMutation({
    onSuccess: (_, variables) => {
      setAddedBooks((prev) => new Set([...prev, variables.bookId]));
    },
  });

  if (!isOpen || !recommendations || recommendations.length === 0) return null;

  const handleAddToWantToRead = (bookId: string) => {
    setStatusMutation.mutate({
      bookId,
      status: "WANT_TO_READ",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                📚 今日のおすすめ本
              </h2>
              <p className="text-blue-100 text-sm md:text-base">
                あなたにぴったりの本をご紹介します
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
              aria-label="閉じる"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {recommendations.map((book) => {
            const isAdded = addedBooks.has(book.id);
            const isLoading = setStatusMutation.isPending;

            return (
              <div
                key={book.id}
                className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-xl hover:shadow-md transition border border-gray-200"
              >
                {/* Book Cover */}
                <Link
                  href={`/books/${book.googleBooksId || book.id}`}
                  className="flex-shrink-0"
                >
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-24 h-36 md:w-28 md:h-42 object-cover rounded-lg shadow-md hover:shadow-lg transition"
                    />
                  ) : (
                    <div className="w-24 h-36 md:w-28 md:h-42 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">📖</span>
                    </div>
                  )}
                </Link>

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/books/${book.googleBooksId || book.id}`}
                    className="block mb-2 hover:text-blue-600 transition"
                  >
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2">
                      {book.title}
                    </h3>
                  </Link>
                  {book.author && (
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                  )}

                  {/* Rating */}
                  {book.reviewCount > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-400">
                        {"★".repeat(Math.round(book.averageRating))}
                        {"☆".repeat(5 - Math.round(book.averageRating))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {book.averageRating.toFixed(1)} ({book.reviewCount}件)
                      </span>
                    </div>
                  )}

                  {/* Categories */}
                  {book.categories && book.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {book.categories.slice(0, 3).map((category) => (
                        <span
                          key={category}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  {book.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {book.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAddToWantToRead(book.id)}
                      disabled={isAdded || isLoading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-sm ${
                        isAdded
                          ? "bg-green-100 text-green-700 cursor-default"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <span>✓</span>
                          <span>追加済み</span>
                        </>
                      ) : (
                        <>
                          <span>📚</span>
                          <span>読みたい</span>
                        </>
                      )}
                    </button>
                    <Link
                      href={`/books/${book.googleBooksId || book.id}`}
                      onClick={onClose}
                      className="flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition text-sm"
                    >
                      <span>📖</span>
                      <span>詳細を見る</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              もっと本を探したいですか？
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/books"
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                📖 本を探す
              </Link>
              <Link
                href="/reading"
                onClick={onClose}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                📚 読書管理
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
