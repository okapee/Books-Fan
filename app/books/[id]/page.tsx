"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ReviewList } from "@/components/book/ReviewList";
import { useState, useEffect } from "react";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateWebsiteStructuredData } from "@/lib/seo";
import { ShareButtons } from "@/components/social/ShareButtons";
import { PurchaseButtons } from "@/components/book/PurchaseButtons";
import { ReadingStatusToggle } from "@/components/reading/ReadingStatusToggle";

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.id as string;
  const { data: session } = useSession();
  const router = useRouter();
  const [dbBookId, setDbBookId] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // HTMLタグを削除する関数
  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  // Google Books IDで本の詳細を取得
  const { data: googleBook, isLoading: googleBookLoading } =
    trpc.book.getByGoogleId.useQuery({
      googleBooksId: bookId,
    });

  // データベースに本を保存または取得
  const getOrCreateMutation = trpc.book.getOrCreate.useMutation({
    onSuccess: (data) => {
      setDbBookId(data.id);
    },
  });

  // Google Bookのデータが取得できたら、DBに保存
  useEffect(() => {
    if (googleBook && !dbBookId && !getOrCreateMutation.isPending) {
      getOrCreateMutation.mutate({ googleBooksId: bookId });
    }
  }, [googleBook, bookId, dbBookId, getOrCreateMutation.isPending]);

  const isLoading = googleBookLoading || getOrCreateMutation.isPending;
  const book = googleBook;

  // お気に入り状態を取得
  const { data: favoriteStatus, refetch: refetchFavorite } =
    trpc.favorite.check.useQuery(
      { bookId: dbBookId || "" },
      { enabled: !!dbBookId && !!session }
    );

  // お気に入り追加/削除
  const addFavorite = trpc.favorite.add.useMutation({
    onSuccess: () => {
      refetchFavorite();
    },
  });

  const removeFavorite = trpc.favorite.remove.useMutation({
    onSuccess: () => {
      refetchFavorite();
    },
  });

  const handleFavoriteClick = () => {
    if (!dbBookId) return;

    if (favoriteStatus?.isFavorite) {
      removeFavorite.mutate({ bookId: dbBookId });
    } else {
      addFavorite.mutate({ bookId: dbBookId });
    }
  };

  // ユーザー情報を取得（プレミアム状態とAI使用回数）
  const { data: currentUser } = trpc.user.getCurrent.useQuery(undefined, {
    enabled: !!session,
  });

  // AI要約を取得
  const { data: aiSummary, refetch: refetchAiSummary } =
    trpc.aiSummary.getByBookId.useQuery(
      { bookId: dbBookId || "" },
      { enabled: !!dbBookId && !!session }
    );

  // AI要約を生成
  const generateSummary = trpc.aiSummary.generateForBook.useMutation({
    onSuccess: () => {
      refetchAiSummary();
      setIsGeneratingSummary(false);
    },
    onError: (error) => {
      alert(error.message);
      setIsGeneratingSummary(false);
    },
  });

  const handleGenerateSummary = () => {
    if (!dbBookId) return;
    if (!currentUser) {
      router.push("/");
      return;
    }

    if (currentUser.membershipType !== "PREMIUM") {
      router.push("/upgrade");
      return;
    }

    setIsGeneratingSummary(true);
    generateSummary.mutate({ bookId: dbBookId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-48 h-72 bg-gray-200 rounded" />
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">本が見つかりませんでした</p>
            <Link
              href="/books"
              className="text-primary hover:underline"
            >
              本を検索する
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 構造化データの生成
  const bookStructuredData = book ? {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author,
    },
    "image": book.coverImageUrl,
    "publisher": book.publisher,
    "datePublished": book.publishedDate,
    "isbn": book.isbn,
    "numberOfPages": book.pageCount,
    "description": book.description?.replace(/<[^>]*>/g, '').substring(0, 200),
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {bookStructuredData && <StructuredData data={bookStructuredData} />}
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Book Detail Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Book Cover */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-40 h-60 sm:w-48 sm:h-72 rounded-lg shadow-md object-cover"
                />
              ) : (
                <div className="w-40 h-60 sm:w-48 sm:h-72 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-5xl sm:text-6xl">📚</span>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2 sm:mb-3">
                {book.title}
              </h1>

              <p className="text-lg sm:text-xl text-gray-700 mb-4">{book.author}</p>

              {/* Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 text-sm">
                {book.publisher && (
                  <div>
                    <span className="text-gray-600">出版社:</span>
                    <span className="ml-2 text-gray-800">{book.publisher}</span>
                  </div>
                )}
                {book.publishedDate && (
                  <div>
                    <span className="text-gray-600">出版日:</span>
                    <span className="ml-2 text-gray-800">
                      {book.publishedDate}
                    </span>
                  </div>
                )}
                {book.pageCount && (
                  <div>
                    <span className="text-gray-600">ページ数:</span>
                    <span className="ml-2 text-gray-800">
                      {book.pageCount} ページ
                    </span>
                  </div>
                )}
                {book.isbn && (
                  <div>
                    <span className="text-gray-600">ISBN:</span>
                    <span className="ml-2 text-gray-800">{book.isbn}</span>
                  </div>
                )}
              </div>

              {/* Categories */}
              {book.categories && book.categories.length > 0 && (
                <div className="mb-6">
                  <span className="text-sm text-gray-600 mr-2">カテゴリ:</span>
                  {book.categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-block bg-secondary text-primary text-sm px-3 py-1 rounded-full mr-2 mb-2"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {session ? (
                  <>
                    {dbBookId && (
                      <ReadingStatusToggle bookId={dbBookId} />
                    )}
                    <Link
                      href={`/books/${bookId}/review`}
                      className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-primary-700 transition text-sm sm:text-base"
                    >
                      レビューを書く
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/"
                    className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-primary-700 transition text-sm sm:text-base"
                  >
                    ログインしてレビューを書く
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-primary mb-4">
                内容紹介
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {stripHtmlTags(book.description)}
              </p>
            </div>
          )}

          {/* Purchase Buttons */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <PurchaseButtons isbn={book.isbn} title={book.title} />
          </div>

          {/* Share Buttons */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              この本をシェア
            </h3>
            <ShareButtons
              url={`/books/${bookId}`}
              title={book.title}
              description={`${book.author}著「${book.title}」をチェック`}
            />
          </div>
        </div>

        {/* AI Summary Section */}
        {session && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">
                  AI要約
                  <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-normal bg-accent text-primary px-2 sm:px-3 py-1 rounded-full">
                    PREMIUM
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  この本の内容をAIが要約します。個別のレビューとは異なり、本全体の概要を把握できます。
                </p>
                {currentUser?.membershipType === "PREMIUM" && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    今月の使用回数: {currentUser.aiUsageCount || 0} / 30回
                  </p>
                )}
              </div>
              {currentUser?.membershipType === "PREMIUM" && !aiSummary && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary || (currentUser.aiUsageCount || 0) >= 30}
                  className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
                >
                  {isGeneratingSummary ? "生成中..." : "AI要約を生成"}
                </button>
              )}
            </div>

            {/* AI Summary Content */}
            {aiSummary ? (
              <div className="space-y-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {aiSummary.summaryText}
                  </div>
                </div>

                {aiSummary.keyPoints && Array.isArray(aiSummary.keyPoints) && aiSummary.keyPoints.length > 0 && (
                  <div className="mt-6 p-6 bg-blue-50 rounded-lg">
                    <h3 className="font-bold text-primary mb-4">主要なポイント</h3>
                    <ul className="space-y-2">
                      {aiSummary.keyPoints.map((kp: any, index: number) => {
                        const pointText = typeof kp === 'string' ? kp : (kp?.point || '');
                        return (
                          <li key={index} className="flex items-start gap-3">
                            <span className="text-primary font-bold mt-1">•</span>
                            <span className="text-gray-700">{pointText}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-right">
                  生成日時: {new Date(aiSummary.createdAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ) : currentUser?.membershipType === "PREMIUM" ? (
              <div className="text-center py-12">
                {isGeneratingSummary ? (
                  <div className="space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-600">AIが要約を生成しています...</p>
                    <p className="text-sm text-gray-500">
                      本の内容を分析中です。30秒〜1分ほどお待ちください。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl mb-4">🤖</div>
                    <p className="text-gray-600 text-lg">
                      この本のAI要約はまだ生成されていません
                    </p>
                    <p className="text-sm text-gray-500">
                      「AI要約を生成」ボタンをクリックして、AIによる本の要約を作成しましょう
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 space-y-6">
                <div className="text-6xl mb-4">⭐</div>
                <div className="space-y-3">
                  <p className="text-gray-700 text-lg font-semibold">
                    AI要約はプレミアム会員限定機能です
                  </p>
                  <p className="text-gray-600">
                    プレミアムプランにアップグレードして、AIによる本の要約機能を利用しましょう
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
                  <h3 className="font-bold text-primary mb-3">
                    プレミアムプランの特典
                  </h3>
                  <ul className="text-left space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      AI要約機能（月30回まで）
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      本の主要ポイントを自動抽出
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      読書効率を大幅アップ
                    </li>
                  </ul>
                </div>
                <Link
                  href="/upgrade"
                  className="inline-block bg-accent text-primary px-8 py-3 rounded-lg font-bold hover:bg-accent/90 transition text-lg"
                >
                  プレミアムにアップグレード
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">レビュー</h2>
            {session && (
              <Link
                href={`/books/${bookId}/review`}
                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                レビューを書く
              </Link>
            )}
          </div>

          {dbBookId && (
            <ReviewList
              bookId={dbBookId}
              googleBooksId={bookId}
              showWriteButton={!!session}
              bookTitle={book.title}
            />
          )}
        </div>
      </div>
    </div>
  );
}
