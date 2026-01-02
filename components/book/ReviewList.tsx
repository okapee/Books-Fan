"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { AISummaryCard } from "@/components/ai/AISummaryCard";
import { FollowButton } from "@/components/user/FollowButton";

interface ReviewListProps {
  bookId: string;
  showWriteButton?: boolean;
  googleBooksId?: string;
  bookTitle?: string;
}

export function ReviewList({
  bookId,
  showWriteButton = true,
  googleBooksId,
  bookTitle,
}: ReviewListProps) {
  const { data: session } = useSession();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [likingReviewId, setLikingReviewId] = useState<string | null>(null);
  const utils = trpc.useContext();

  const { data: reviews, isLoading } = trpc.review.getByBookId.useQuery({
    bookId,
  });

  // バッチクエリのためにレビューIDを抽出
  const reviewIds = useMemo(
    () => reviews?.map((r) => r.id) ?? [],
    [reviews]
  );

  // バッチメタデータ取得（いいね数とコメント数を一度に取得）
  const { data: batchMetadata } = trpc.review.getBatchMetadata.useQuery(
    { reviewIds },
    { enabled: reviewIds.length > 0 }
  );

  // ユーザーのいいね状態をバッチ取得
  const { data: batchLikeStatus } = trpc.review.getBatchLikeStatus.useQuery(
    { reviewIds },
    { enabled: reviewIds.length > 0 && !!session }
  );

  const deleteReview = trpc.review.delete.useMutation({
    onSuccess: () => {
      // Refetch reviews after deletion
      utils.review.getByBookId.invalidate({ bookId });
      setDeletingId(null);
    },
    onError: (error) => {
      alert(`削除に失敗しました: ${error.message}`);
      setDeletingId(null);
    },
  });

  const addLike = trpc.review.addLike.useMutation({
    onSuccess: () => {
      // バッチメタデータを再取得
      utils.review.getBatchMetadata.invalidate({ reviewIds });
      utils.review.getBatchLikeStatus.invalidate({ reviewIds });
      setLikingReviewId(null);
    },
    onError: () => {
      setLikingReviewId(null);
    },
  });

  const removeLike = trpc.review.removeLike.useMutation({
    onSuccess: () => {
      // バッチメタデータを再取得
      utils.review.getBatchMetadata.invalidate({ reviewIds });
      utils.review.getBatchLikeStatus.invalidate({ reviewIds });
      setLikingReviewId(null);
    },
    onError: () => {
      setLikingReviewId(null);
    },
  });

  const handleDelete = (reviewId: string) => {
    if (
      confirm(
        "このレビューを削除してもよろしいですか？この操作は取り消せません。"
      )
    ) {
      setDeletingId(reviewId);
      deleteReview.mutate({ id: reviewId });
    }
  };

  const handleLikeToggle = (reviewId: string, isLiked: boolean) => {
    if (!session) {
      alert("いいねするにはログインが必要です");
      return;
    }

    setLikingReviewId(reviewId);
    if (isLiked) {
      removeLike.mutate({ reviewId });
    } else {
      addLike.mutate({ reviewId });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-6 animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-20 bg-gray-200 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">まだレビューがありません</p>
        {showWriteButton && googleBooksId && (
          <Link
            href={`/books/${googleBooksId}/review`}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition inline-block"
          >
            最初のレビューを書く
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow"
        >
          {/* User Info */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {review.user.image ? (
                  <img
                    src={review.user.image}
                    alt={review.user.name || "User"}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-200 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-base sm:text-lg">
                      {review.user.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-sm sm:text-base text-gray-900">
                    {review.user.name || "匿名ユーザー"}
                  </p>
                  {session?.user?.id !== review.userId && (
                    <FollowButton userId={review.userId} variant="compact" />
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3 mt-1">
                  {/* Star Rating */}
                  <div className="flex text-sm sm:text-base">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < review.rating ? "text-accent" : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {review.rating}.0
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 ml-13 sm:ml-0">
              {/* Date */}
              <div className="text-xs sm:text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              {/* Edit/Delete Buttons - Only show for own reviews */}
              {session?.user?.id === review.userId && googleBooksId && (
                <div className="flex gap-2">
                  <Link
                    href={`/books/${googleBooksId}/review/${review.id}`}
                    className="text-xs sm:text-sm text-primary hover:underline whitespace-nowrap"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="text-xs sm:text-sm text-red-600 hover:underline disabled:opacity-50 whitespace-nowrap"
                  >
                    {deletingId === review.id ? "削除中..." : "削除"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Review Content */}
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line mb-3">
            {review.content}
          </p>

          {/* Read Completion Date */}
          {review.readCompletedDate && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>📖</span>
              <span>
                読了日:{" "}
                {new Date(review.readCompletedDate).toLocaleDateString(
                  "ja-JP",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>
          )}

          {/* AI Summary */}
          <AISummaryCard
            reviewId={review.id}
            isPremiumUser={session?.user?.membershipType === "PREMIUM"}
            showGenerateButton={true}
            bookTitle={bookTitle || "書籍"}
          />

          {/* Like and Comment Actions */}
          <ReviewActions
            reviewId={review.id}
            googleBooksId={googleBooksId}
            onLikeToggle={handleLikeToggle}
            isLiking={likingReviewId === review.id}
            isLoggedIn={!!session}
            likeCount={batchMetadata?.likes && review.id in batchMetadata.likes ? (batchMetadata.likes as Record<string, number>)[review.id] : 0}
            commentCount={batchMetadata?.comments && review.id in batchMetadata.comments ? (batchMetadata.comments as Record<string, number>)[review.id] : 0}
            isLiked={batchLikeStatus && review.id in batchLikeStatus ? (batchLikeStatus as Record<string, boolean>)[review.id] : false}
          />
        </div>
      ))}

      {/* Summary */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          全 {reviews.length} 件のレビュー
        </p>
      </div>
    </div>
  );
}

// Like and Comment Actions Component
interface ReviewActionsProps {
  reviewId: string;
  googleBooksId?: string;
  onLikeToggle: (reviewId: string, isLiked: boolean) => void;
  isLiking: boolean;
  isLoggedIn: boolean;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

function ReviewActions({
  reviewId,
  googleBooksId,
  onLikeToggle,
  isLiking,
  isLoggedIn,
  likeCount,
  commentCount,
  isLiked,
}: ReviewActionsProps) {
  // バッチデータをpropsから受け取るため、クエリは不要

  return (
    <div className="flex items-center gap-3 sm:gap-6 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
      {/* Like Button */}
      <button
        onClick={() => onLikeToggle(reviewId, isLiked)}
        disabled={isLiking}
        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition disabled:opacity-50 ${
          isLiked
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
        }`}
      >
        <span className="text-base sm:text-lg">{isLiked ? "❤️" : "🤍"}</span>
        <span className="text-xs sm:text-sm">
          {isLiking ? "..." : likeCount || 0}
        </span>
      </button>

      {/* Comment Link */}
      {googleBooksId && (
        <Link
          href={`/books/${googleBooksId}/review/${reviewId}`}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
        >
          <span className="text-base sm:text-lg">💬</span>
          <span className="text-xs sm:text-sm">{commentCount}</span>
        </Link>
      )}
    </div>
  );
}
