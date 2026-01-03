"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import Link from "next/link";
import { FollowButton } from "@/components/user/FollowButton";
import { UserStats } from "@/components/user/UserStats";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateBookReviewStructuredData } from "@/lib/seo";
import { ShareButtons } from "@/components/social/ShareButtons";

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  const reviewId = params.reviewId as string;
  const { data: session } = useSession();

  const [isEditMode, setIsEditMode] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [readCompletedDate, setReadCompletedDate] = useState("");
  const [error, setError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // コメント投稿用
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const utils = trpc.useContext();

  // Get specific review directly
  const { data: review, isLoading: reviewLoading } = trpc.review.getById.useQuery({
    reviewId,
  });

  // Get book details
  const { data: book } = trpc.book.getByGoogleId.useQuery({
    googleBooksId: bookId,
  });

  // Get comments
  const { data: comments, isLoading: commentsLoading } =
    trpc.review.getComments.useQuery({ reviewId });

  // Get like count and status
  const { data: likeCount } = trpc.review.getLikeCount.useQuery({ reviewId });
  const { data: likeStatus } = trpc.review.checkLike.useQuery(
    { reviewId },
    { enabled: !!session }
  );

  // Initialize form with existing review data when entering edit mode
  if (review && isEditMode && !isInitialized) {
    setRating(review.rating);
    setContent(review.content);
    setIsPublic(review.isPublic);
    if (review.readCompletedDate) {
      setReadCompletedDate(
        new Date(review.readCompletedDate).toISOString().split("T")[0]
      );
    }
    setIsInitialized(true);
  }

  const updateReview = trpc.review.update.useMutation({
    onSuccess: () => {
      setIsEditMode(false);
      setIsInitialized(false);
      utils.review.getById.invalidate({ reviewId });
      if (review?.bookId) {
        utils.review.getByBookId.invalidate({ bookId: review.bookId });
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const addLike = trpc.review.addLike.useMutation({
    onSuccess: () => {
      utils.review.getLikeCount.invalidate({ reviewId });
      utils.review.checkLike.invalidate({ reviewId });
    },
  });

  const removeLike = trpc.review.removeLike.useMutation({
    onSuccess: () => {
      utils.review.getLikeCount.invalidate({ reviewId });
      utils.review.checkLike.invalidate({ reviewId });
    },
  });

  const addComment = trpc.review.addComment.useMutation({
    onSuccess: () => {
      setCommentContent("");
      setIsSubmittingComment(false);
      utils.review.getComments.invalidate({ reviewId });
    },
    onError: () => {
      setIsSubmittingComment(false);
      alert("コメントの投稿に失敗しました");
    },
  });

  const deleteComment = trpc.review.deleteComment.useMutation({
    onSuccess: () => {
      utils.review.getComments.invalidate({ reviewId });
    },
  });

  const handleLikeToggle = () => {
    if (!session) {
      alert("いいねするにはログインが必要です");
      return;
    }

    if (likeStatus?.isLiked) {
      removeLike.mutate({ reviewId });
    } else {
      addLike.mutate({ reviewId });
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("評価を選択してください");
      return;
    }

    if (content.length < 10) {
      setError("レビューは10文字以上入力してください");
      return;
    }

    updateReview.mutate({
      id: reviewId,
      rating,
      content,
      isPublic,
      readCompletedDate: readCompletedDate
        ? new Date(readCompletedDate)
        : undefined,
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("コメントするにはログインが必要です");
      return;
    }

    if (commentContent.trim().length === 0) {
      return;
    }

    setIsSubmittingComment(true);
    addComment.mutate({
      reviewId,
      content: commentContent.trim(),
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm("このコメントを削除してもよろしいですか？")) {
      deleteComment.mutate({ commentId });
    }
  };

  if (reviewLoading || !review) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-12 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-32 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.id === review.userId;
  const isLiked = likeStatus?.isLiked || false;

  // 構造化データの生成（View Modeの時のみ）
  const reviewStructuredData = book && review && !isEditMode ? generateBookReviewStructuredData(
    book.title,
    book.author,
    book.coverImageUrl || undefined,
    review.rating,
    review.content,
    review.user.name || "匿名ユーザー",
    review.createdAt.toISOString(),
    `/books/${bookId}/review/${reviewId}`
  ) : null;

  // Edit Mode
  if (isEditMode && isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary mb-4">
                レビューを編集
              </h1>

              {book && (
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-16 h-24 rounded shadow-sm object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">📚</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg text-gray-900 line-clamp-2">
                      {book.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{book.author}</p>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  評価 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="text-4xl focus:outline-none transition-transform hover:scale-110"
                    >
                      <span
                        className={
                          star <= (hoveredRating || rating)
                            ? "text-accent"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 mt-2">{rating} / 5</p>
                )}
              </div>

              {/* Review Content */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  レビュー <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  placeholder="この本の感想を書いてください（10文字以上）"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {content.length} / 10文字以上
                </p>
              </div>

              {/* Read Completion Date */}
              <div>
                <label
                  htmlFor="readCompletedDate"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  読了日（任意）
                </label>
                <input
                  type="date"
                  id="readCompletedDate"
                  value={readCompletedDate}
                  onChange={(e) => setReadCompletedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Public/Private Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  このレビューを公開する
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={updateReview.isPending}
                  className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateReview.isPending ? "更新中..." : "更新する"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(false);
                    setIsInitialized(false);
                  }}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // View Mode (Default)
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-12">
      {reviewStructuredData && <StructuredData data={reviewStructuredData} />}
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        {/* Review Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-6">
          {/* Back Link */}
          <Link
            href={`/books/${bookId}`}
            className="inline-flex items-center text-sm sm:text-base text-primary hover:underline mb-4 sm:mb-6"
          >
            ← 本の詳細に戻る
          </Link>

          {/* Book Info */}
          {book && (
            <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg mb-4 sm:mb-6">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-16 h-24 sm:w-20 sm:h-30 rounded shadow-sm object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-24 sm:w-20 sm:h-30 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl sm:text-4xl">📚</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base sm:text-xl text-gray-900 mb-1 line-clamp-2">
                  {book.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 truncate">{book.author}</p>
              </div>
            </div>
          )}

          {/* Review Header */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-shrink-0">
              {review.user.image ? (
                <img
                  src={review.user.image}
                  alt={review.user.name || "User"}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-200 rounded-full flex items-center justify-center"
                style={{ display: review.user.image ? 'none' : 'flex' }}
              >
                <span className="text-primary font-semibold text-lg sm:text-2xl">
                  {review.user.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  {review.user.name || "匿名ユーザー"}のレビュー
                </h1>
                {!isOwner && <FollowButton userId={review.userId} variant="compact" />}
              </div>

              <UserStats userId={review.userId} className="mb-2 sm:mb-3" />

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                {/* Star Rating */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < review.rating ? "text-accent text-lg sm:text-2xl" : "text-gray-300 text-lg sm:text-2xl"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-base sm:text-lg font-semibold text-gray-700">
                    {review.rating}.0
                  </span>
                </div>

                {/* Date */}
                <span className="text-xs sm:text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Edit Button (only for owner) */}
              {isOwner && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="text-sm text-primary hover:underline"
                >
                  編集
                </button>
              )}
            </div>
          </div>

          {/* Review Content */}
          <div className="prose max-w-none mb-4 sm:mb-6">
            <p className="text-gray-700 text-sm sm:text-lg leading-relaxed whitespace-pre-line">
              {review.content}
            </p>
          </div>

          {/* Read Completion Date */}
          {review.readCompletedDate && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
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

          {/* Like Button */}
          <div className="flex items-center gap-3 sm:gap-6 pt-4 sm:pt-6 border-t border-gray-100">
            <button
              onClick={handleLikeToggle}
              disabled={addLike.isPending || removeLike.isPending}
              className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition disabled:opacity-50 ${
                isLiked
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg sm:text-2xl">{isLiked ? "❤️" : "🤍"}</span>
              <span>{likeCount || 0} いいね</span>
            </button>
          </div>

          {/* Share Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              このレビューをシェア
            </h3>
            <ShareButtons
              url={`/books/${bookId}/review/${reviewId}`}
              title={book ? `${book.title}のレビュー` : "レビュー"}
              description={
                book && review
                  ? `${review.user.name || "匿名ユーザー"}さんの「${book.title}」のレビュー（評価: ${review.rating}/5）`
                  : undefined
              }
            />
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6">
            コメント ({comments?.length || 0})
          </h2>

          {/* Comment Form */}
          {session ? (
            <form onSubmit={handleCommentSubmit} className="mb-6 sm:mb-8">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="コメントを入力..."
                rows={3}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                disabled={isSubmittingComment}
              />
              <div className="flex justify-end mt-2 sm:mt-3">
                <button
                  type="submit"
                  disabled={
                    isSubmittingComment || commentContent.trim().length === 0
                  }
                  className="bg-primary text-white px-4 py-2 sm:px-6 text-sm sm:text-base rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? "投稿中..." : "コメントする"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">
                コメントするにはログインが必要です
              </p>
              <Link
                href="/"
                className="text-sm sm:text-base text-primary hover:underline font-semibold"
              >
                ログインする
              </Link>
            </div>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 animate-pulse"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition"
                >
                  <div className="flex gap-2 sm:gap-3">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {comment.user.image ? (
                        <img
                          src={comment.user.image}
                          alt={comment.user.name || "User"}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-200 rounded-full flex items-center justify-center"
                        style={{ display: comment.user.image ? 'none' : 'flex' }}
                      >
                        <span className="text-primary font-semibold text-sm sm:text-base">
                          {comment.user.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <span className="font-semibold text-sm sm:text-base text-gray-900">
                          {comment.user.name || "匿名ユーザー"}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "ja-JP",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                        {session?.user?.id === comment.userId && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs sm:text-sm text-red-600 hover:underline ml-auto"
                          >
                            削除
                          </button>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">まだコメントがありません</p>
              <p className="text-sm text-gray-400 mt-2">
                最初のコメントを投稿しましょう
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
