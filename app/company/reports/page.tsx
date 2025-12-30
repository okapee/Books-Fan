"use client";

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function CompanyReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reportType, setReportType] = useState<"week" | "month">("month");

  const { data: weeklyReport, isLoading: weeklyLoading } =
    trpc.company.getWeeklyReport.useQuery(undefined, {
      enabled: reportType === "week",
    });
  const { data: monthlyReport, isLoading: monthlyLoading } =
    trpc.company.getMonthlyReport.useQuery(undefined, {
      enabled: reportType === "month",
    });
  const { data: company } = trpc.company.getCompanyInfo.useQuery();

  const report = reportType === "week" ? weeklyReport : monthlyReport;
  const isLoading = reportType === "week" ? weeklyLoading : monthlyLoading;

  // 認証チェック
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">企業アカウントなし</h1>
          <p className="text-gray-600 mb-6">
            企業アカウントに所属していません。
          </p>
          <Link
            href="/company/register"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition"
          >
            企業アカウントを作成
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">統計レポート</h1>
        <p className="text-gray-600">企業の読書活動の統計データを確認できます</p>
      </div>

      {/* ナビゲーションタブ */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex gap-8">
          <Link
            href="/company/dashboard"
            className="pb-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
          >
            ダッシュボード
          </Link>
          <Link
            href="/company/feed"
            className="pb-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
          >
            社内フィード
          </Link>
          <Link
            href="/company/reports"
            className="pb-4 border-b-2 border-primary text-primary font-semibold"
          >
            統計レポート
          </Link>
        </nav>
      </div>

      {/* レポート期間選択 */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setReportType("week")}
          className={`px-6 py-3 rounded-lg font-bold transition ${
            reportType === "week"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📅 週次レポート
        </button>
        <button
          onClick={() => setReportType("month")}
          className={`px-6 py-3 rounded-lg font-bold transition ${
            reportType === "month"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📊 月次レポート
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : report ? (
        <div className="space-y-8">
          {/* 期間表示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <strong>対象期間:</strong>{" "}
              {new Date(report.startDate).toLocaleDateString("ja-JP")} ~{" "}
              {new Date(report.endDate).toLocaleDateString("ja-JP")}
            </p>
          </div>

          {/* メトリクスカード */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* レビュー数 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">
                  レビュー数
                </h3>
                <span className="text-2xl">📝</span>
              </div>
              <div className="text-4xl font-bold text-primary mb-2">
                {report.metrics.reviews.count}
              </div>
              <div
                className={`text-sm ${
                  report.metrics.reviews.change >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {report.metrics.reviews.change >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(report.metrics.reviews.change).toFixed(1)}%{" "}
                {reportType === "week" ? "先週比" : "先月比"}
              </div>
            </div>

            {/* お気に入り数 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">
                  お気に入り
                </h3>
                <span className="text-2xl">⭐</span>
              </div>
              <div className="text-4xl font-bold text-primary mb-2">
                {report.metrics.favorites.count}
              </div>
              {"change" in report.metrics.favorites &&
                report.metrics.favorites.change !== undefined && (
                  <div
                    className={`text-sm ${
                      report.metrics.favorites.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {report.metrics.favorites.change >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(report.metrics.favorites.change).toFixed(1)}%{" "}
                    {reportType === "week" ? "先週比" : "先月比"}
                  </div>
                )}
            </div>

            {/* アクティブユーザー */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">
                  アクティブユーザー
                </h3>
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-4xl font-bold text-primary mb-2">
                {report.metrics.activeUsers.count}
              </div>
              {"total" in report.metrics.activeUsers &&
                report.metrics.activeUsers.total !== undefined && (
                  <div className="text-sm text-gray-600">
                    全体の{" "}
                    {report.metrics.activeUsers.percentage?.toFixed(1)}%
                  </div>
                )}
            </div>
          </div>

          {/* 週次レポートの最も人気の本 */}
          {reportType === "week" && weeklyReport?.topBook && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">今週の人気本</h2>
              <Link
                href={`/books/${weeklyReport.topBook.googleBooksId}`}
                className="flex gap-4 hover:bg-gray-50 p-4 rounded-lg transition"
              >
                {weeklyReport.topBook.coverImageUrl && (
                  <img
                    src={weeklyReport.topBook.coverImageUrl}
                    alt={weeklyReport.topBook.title}
                    className="w-24 h-36 object-cover rounded shadow"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold hover:text-primary transition">
                    {weeklyReport.topBook.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {weeklyReport.topBook.author}
                  </p>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        {weeklyReport.topBook.reviewCount}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">
                        件のレビュー
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-xl">★</span>
                      <span className="font-bold">
                        {weeklyReport.topBook.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* 月次レポートの人気本TOP5 */}
          {reportType === "month" &&
            monthlyReport?.topBooks &&
            monthlyReport.topBooks.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">今月の人気本 TOP5</h2>
                <div className="space-y-4">
                  {monthlyReport.topBooks.map((book, index) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.googleBooksId}`}
                      className="flex items-center gap-4 hover:bg-gray-50 p-3 rounded-lg transition"
                    >
                      <span className="text-3xl font-bold text-gray-400 w-8">
                        {index + 1}
                      </span>
                      {book.coverImageUrl && (
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded shadow"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold hover:text-primary transition">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-600">{book.author}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500">
                            {book.reviewCount}件
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm font-semibold">
                              {book.averageRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          {/* 月次レポートのトップレビュアー */}
          {reportType === "month" &&
            monthlyReport?.topReviewers &&
            monthlyReport.topReviewers.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">
                  今月のトップレビュアー
                </h2>
                <div className="grid md:grid-cols-5 gap-4">
                  {monthlyReport.topReviewers.map((reviewer, index) => (
                    <Link
                      key={reviewer.id}
                      href={`/profile/${reviewer.id}`}
                      className="text-center hover:bg-gray-50 p-4 rounded-lg transition"
                    >
                      <div className="relative inline-block mb-2">
                        {reviewer.image ? (
                          <img
                            src={reviewer.image}
                            alt={reviewer.name || "User"}
                            className="w-16 h-16 rounded-full object-cover mx-auto"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mx-auto">
                            {reviewer.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        {index === 0 && (
                          <span className="absolute -top-2 -right-2 text-2xl">
                            🥇
                          </span>
                        )}
                        {index === 1 && (
                          <span className="absolute -top-2 -right-2 text-2xl">
                            🥈
                          </span>
                        )}
                        {index === 2 && (
                          <span className="absolute -top-2 -right-2 text-2xl">
                            🥉
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm truncate">
                        {reviewer.name || "名前なし"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {reviewer.reviewCount}件
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600">レポートデータがありません</p>
        </div>
      )}
    </div>
  );
}
