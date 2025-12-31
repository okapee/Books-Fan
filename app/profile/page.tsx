import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  // ユーザーの詳細情報を取得
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          book: true,
        },
      },
      _count: {
        select: {
          reviews: true,
          aiSummaries: true,
          favoriteBooks: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  // AI使用制限の計算
  const aiLimit = user.membershipType === "PREMIUM" ? 30 : 0;
  const aiUsagePercentage = aiLimit > 0 ? (user.aiUsageCount / aiLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={96}
                  height={96}
                  className="rounded-full sm:w-28 sm:h-28 md:w-[120px] md:h-[120px]"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-30 md:h-30 bg-primary text-white rounded-full flex items-center justify-center text-3xl sm:text-4xl">
                  {user.name?.charAt(0) || "U"}
                </div>
              )}
              {user.membershipType === "PREMIUM" && (
                <div className="absolute -bottom-2 -right-2 bg-accent text-primary text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                  PREMIUM
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                {user.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{user.email}</p>
              {user.bio && (
                <p className="text-sm sm:text-base text-gray-700 mb-4">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-4 sm:gap-6 mt-4">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {user._count.reviews}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">レビュー</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {user._count.aiSummaries}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">AI要点</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {user._count.favoriteBooks}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">お気に入り</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
              <Link
                href="/profile/edit"
                className="flex-1 sm:flex-none bg-primary text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-primary-700 transition text-center text-sm sm:text-base whitespace-nowrap"
              >
                プロフィール編集
              </Link>
              {user._count.reviews > 0 && (
                <Link
                  href="/profile/mindmap"
                  className="flex-1 sm:flex-none bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-700 transition text-center flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  マインドマップ
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Membership Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8">
          {/* Membership Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-primary mb-4">
              会員プラン
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">現在のプラン</span>
                <span className="font-bold text-primary">
                  {user.membershipType === "PREMIUM" ? "プレミアム" : "無料"}
                </span>
              </div>
              {user.membershipType === "PREMIUM" ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">ステータス</span>
                    <span className={`font-semibold ${
                      user.subscriptionStatus === "ACTIVE"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}>
                      {user.subscriptionStatus === "ACTIVE" ? "有効" : "更新待ち"}
                    </span>
                  </div>
                  {user.currentPeriodEnd && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">次回更新日</span>
                      <span className="text-gray-800">
                        {new Date(user.currentPeriodEnd).toLocaleDateString("ja-JP")}
                      </span>
                    </div>
                  )}
                  <Link
                    href="/settings/billing"
                    className="block text-center bg-gray-100 text-primary px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    プラン管理
                  </Link>
                </>
              ) : (
                <Link
                  href="/pricing"
                  className="block text-center bg-accent text-primary px-4 py-3 rounded-lg hover:bg-accent/90 transition font-semibold"
                >
                  プレミアムにアップグレード
                </Link>
              )}
            </div>
          </div>

          {/* AI Usage Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-primary mb-4">
              AI使用状況
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">今月の使用回数</span>
                <span className="font-bold text-primary">
                  {user.aiUsageCount} / {aiLimit}
                </span>
              </div>

              {/* Progress Bar */}
              {user.membershipType === "PREMIUM" && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        aiUsagePercentage >= 90
                          ? "bg-red-500"
                          : aiUsagePercentage >= 70
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(aiUsagePercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    残り {aiLimit - user.aiUsageCount} 回
                  </p>
                </div>
              )}

              {user.membershipType === "FREE" && (
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-3">
                    プレミアムプランで月30回までAI要点生成が可能になります
                  </p>
                  <Link
                    href="/pricing"
                    className="block text-center bg-accent text-primary px-4 py-2 rounded-lg hover:bg-accent/90 transition font-semibold text-sm"
                  >
                    詳しく見る
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-primary mb-6">
            最近のレビュー
          </h2>
          {user.reviews.length > 0 ? (
            <div className="space-y-4">
              {user.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-primary mb-1">
                        {review.book.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {review.book.author}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < review.rating
                                  ? "text-accent"
                                  : "text-gray-300"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                      <p className="text-gray-700 line-clamp-2">
                        {review.content}
                      </p>
                    </div>
                    <Link
                      href={`/books/${review.book.googleBooksId || review.book.id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      詳細 →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                まだレビューがありません
              </p>
              <Link
                href="/books"
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition inline-block"
              >
                本を探してレビューを書く
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
