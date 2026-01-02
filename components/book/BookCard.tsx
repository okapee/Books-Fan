"use client";

import Link from "next/link";
import { memo } from "react";

interface BookCardProps {
  id: string;
  googleBooksId?: string;
  title: string;
  author: string;
  coverImageUrl?: string | null;
  averageRating?: number | null;
  reviewCount?: number;
  description?: string | null;
  reviewedBy?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  userRating?: number | null;
}

// HTMLタグを削除する関数（コンポーネント外に移動）
const stripHtmlTags = (html: string) => {
  return html.replace(/<[^>]*>/g, '');
};

export const BookCard = memo(function BookCard({
  id,
  googleBooksId,
  title,
  author,
  coverImageUrl,
  averageRating,
  reviewCount,
  description,
  reviewedBy,
  userRating,
}: BookCardProps) {
  // Google Books IDがあればそれを使用、なければ通常のIDを使用
  const bookUrl = googleBooksId ? `/books/${googleBooksId}` : `/books/${id}`;

  return (
    <Link
      href={bookUrl}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4 flex flex-col h-full relative"
    >
      {/* Reviewed by badge (top right corner) */}
      {reviewedBy && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-white/95 rounded-full px-2.5 py-1.5 shadow-md border border-gray-200">
          {reviewedBy.image ? (
            <img
              src={reviewedBy.image}
              alt={reviewedBy.name || "User"}
              className="w-5 h-5 rounded-full object-cover"
              title={`${reviewedBy.name}さんのレビュー`}
            />
          ) : (
            <div
              className="w-5 h-5 bg-primary-200 rounded-full flex items-center justify-center"
              title={`${reviewedBy.name}さんのレビュー`}
            >
              <span className="text-primary font-semibold text-[10px]">
                {reviewedBy.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          {userRating !== null && userRating !== undefined && (
            <span className="text-yellow-500 text-sm leading-none">
              {"★".repeat(userRating)}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-4 mb-3">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={title}
              className="w-20 h-30 rounded shadow-sm object-cover"
            />
          ) : (
            <div className="w-20 h-30 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-4xl">📚</span>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-primary line-clamp-2 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{author}</p>

          {/* Rating */}
          {averageRating !== null && averageRating !== undefined && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < Math.round(averageRating)
                        ? "text-accent"
                        : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-600">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Review Count */}
          {reviewCount !== undefined && reviewCount > 0 && (
            <p className="text-xs text-gray-500">
              {reviewCount} 件のレビュー
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-700 line-clamp-2 mt-auto">
          {stripHtmlTags(description)}
        </p>
      )}
    </Link>
  );
});
