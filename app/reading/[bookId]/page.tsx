"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { PomodoroTimer } from "@/components/reading/PomodoroTimer";
import { SessionHistory } from "@/components/reading/SessionHistory";
import Link from "next/link";
import { useState } from "react";

export default function ReadingSessionPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const { data: session, status } = useSession();
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  const { data: book, isLoading: bookLoading } =
    trpc.book.getByGoogleId.useQuery({
      googleBooksId: bookId,
    });

  const { data: statusData } = trpc.reading.getStatus.useQuery({
    bookId: book?.id || "",
  }, {
    enabled: !!book?.id,
  });

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (status === "loading" || bookLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">読込中...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-xl text-gray-600">本が見つかりません</p>
        </div>
      </div>
    );
  }

  const handleSessionComplete = () => {
    setShowReviewPrompt(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/reading"
            className="text-primary hover:underline mb-4 inline-block text-sm"
          >
            ← 読書リストに戻る
          </Link>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {book.coverImageUrl && (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="w-24 h-36 sm:w-32 sm:h-48 object-cover rounded-lg shadow-md"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                {book.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 mb-4">
                {book.author}
              </p>

              {statusData?.status === "READING" ? (
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm">
                  <span>📖</span>
                  <span>読書中</span>
                </div>
              ) : (
                <div className="text-yellow-600 text-sm">
                  ⚠️ この本は「読書中」ステータスに設定してください
                </div>
              )}
            </div>
          </div>
        </div>

        {/* レビュー促進モーダル */}
        {showReviewPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md mx-4 w-full">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                🎉 おつかれさまでした!
              </h3>
              <p className="text-gray-700 mb-6 text-sm sm:text-base">
                読書セッションが完了しました。この本を読了した場合は、レビューを書いてみませんか?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href={`/books/${bookId}/review`}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold text-center hover:bg-primary-700 transition text-sm sm:text-base"
                >
                  レビューを書く
                </Link>
                <button
                  onClick={() => setShowReviewPrompt(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  後で
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* タイマー */}
          <div>
            {statusData?.status === "READING" ? (
              <PomodoroTimer
                bookId={book.id}
                bookTitle={book.title}
                onComplete={handleSessionComplete}
              />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 sm:p-8 text-center">
                <p className="text-yellow-800 mb-4 text-sm sm:text-base">
                  タイマーを使用するには、この本を「読書中」ステータスに設定してください
                </p>
                <Link
                  href={`/books/${bookId}`}
                  className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition text-sm sm:text-base"
                >
                  本の詳細ページへ
                </Link>
              </div>
            )}
          </div>

          {/* セッション履歴 */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <SessionHistory bookId={book.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
