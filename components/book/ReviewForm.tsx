"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ReviewFormProps {
  googleBooksId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ googleBooksId, onSuccess }: ReviewFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [readCompletedDate, setReadCompletedDate] = useState("");
  const [generateAISummary, setGenerateAISummary] = useState(false);
  const [error, setError] = useState("");

  const isPremiumUser = session?.user?.membershipType === "PREMIUM";

  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/books/${googleBooksId}`);
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (rating === 0) {
      setError("評価を選択してください");
      return;
    }

    if (content.length < 30) {
      setError("レビューは30文字以上入力してください");
      return;
    }

    createReview.mutate({
      googleBooksId,
      rating,
      content,
      isPublic,
      readCompletedDate: readCompletedDate
        ? new Date(readCompletedDate)
        : undefined,
      generateAISummary: generateAISummary && isPremiumUser,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          placeholder="この本の感想を書いてください（30文字以上）"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          {content.length} / 30文字以上
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

      {/* AI Summary Toggle (Premium only) */}
      {isPremiumUser && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="generateAISummary"
              checked={generateAISummary}
              onChange={(e) => setGenerateAISummary(e.target.checked)}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-0.5"
            />
            <div className="flex-1">
              <label htmlFor="generateAISummary" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span>🤖 AI要約を自動生成</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  PREMIUM
                </span>
              </label>
              <p className="text-xs text-gray-600 mt-1">
                レビュー投稿後、自動的にAI要約とマインドマップを生成します
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={createReview.isPending}
          className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createReview.isPending ? "投稿中..." : "レビューを投稿"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
