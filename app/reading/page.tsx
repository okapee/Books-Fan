"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import Link from "next/link";

export default function ReadingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "want-to-read" | "reading" | "completed"
  >("reading");

  const statusMap = {
    "want-to-read": "WANT_TO_READ",
    reading: "READING",
    completed: "COMPLETED",
  };

  // Hooksは条件分岐の前に呼び出す
  const { data, isLoading } = trpc.reading.getByStatus.useQuery(
    {
      status: statusMap[activeTab] as any,
      limit: 20,
    },
    {
      enabled: status === "authenticated", // 認証済みの時だけクエリを実行
    }
  );

  const { data: stats } = trpc.reading.getStats.useQuery(undefined, {
    enabled: status === "authenticated", // 認証済みの時だけクエリを実行
  });

  // 認証チェックはHooksの後
  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">読込中...</div>
      </div>
    );
  }

  const tabs = [
    { id: "want-to-read", label: "読みたい", icon: "📚" },
    { id: "reading", label: "読書中", icon: "📖" },
    { id: "completed", label: "読了", icon: "✅" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-8">
          読書管理
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* タブ */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 sm:px-6 py-3 font-semibold transition flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 書籍グリッド */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              {isLoading ? (
                <div className="text-center py-12">読込中...</div>
              ) : data && data.books.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {data.books.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <Link
                        href={`/books/${
                          item.book.googleBooksId || item.book.id
                        }`}
                        className="flex gap-4"
                      >
                        {item.book.coverImageUrl && (
                          <img
                            src={item.book.coverImageUrl}
                            alt={item.book.title}
                            className="w-16 sm:w-20 h-24 sm:h-30 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 text-sm sm:text-base">
                            {item.book.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">
                            {item.book.author}
                          </p>
                          {activeTab === "reading" &&
                            item.totalReadingTime > 0 && (
                              <div className="text-xs text-green-600 font-semibold">
                                📖 {Math.floor(item.totalReadingTime / 60)}
                                分読書
                              </div>
                            )}
                        </div>
                      </Link>

                      {activeTab === "reading" && (
                        <Link
                          href={`/reading/${
                            item.book.googleBooksId || item.book.id
                          }`}
                          className="mt-4 block text-center bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition text-sm"
                        >
                          読書を始める
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl sm:text-6xl mb-4">📚</div>
                  <p className="text-sm sm:text-base">
                    まだ本が登録されていません
                  </p>
                  <Link
                    href="/books"
                    className="mt-4 inline-block text-primary hover:underline text-sm"
                  >
                    本を探す →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* サイドバー - 統計 */}
          <div className="space-y-6">
            {stats && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-md">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  📚 読書の記録
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg hover:shadow-lg transition">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {stats.wantToRead}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      読みたい
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg hover:shadow-lg transition">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">
                      {stats.reading}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      読書中
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg hover:shadow-lg transition">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                      {stats.completed}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      読了
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg hover:shadow-lg transition">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                      {stats.readingDaysLast30}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      日間継続
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        総読書時間
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        {Math.floor(stats.totalReadingTime / 3600)}h
                        {Math.floor((stats.totalReadingTime % 3600) / 60)}m
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        セッション
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        {stats.totalSessions}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
