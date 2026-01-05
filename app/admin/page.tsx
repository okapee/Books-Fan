"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 認証チェック
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin");
    }
  }, [status, router]);

  // 管理者権限チェック
  useEffect(() => {
    if (session?.user && (session.user as any).role !== "ADMIN") {
      router.push("/");
    }
  }, [session, router]);

  const { data: blogStats } = trpc.blog.getMyPosts.useQuery();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }

  const publishedCount = blogStats?.filter((p) => p.isPublished).length || 0;
  const draftCount = blogStats?.filter((p) => !p.isPublished).length || 0;
  const totalViews = blogStats?.reduce((sum, p) => sum + p.viewCount, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
            管理者ダッシュボード
          </h1>
          <p className="text-gray-600">
            ようこそ、{session.user?.name || "管理者"}さん
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">総記事数</h3>
              <div className="text-2xl">📝</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {blogStats?.length || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">公開中</h3>
              <div className="text-2xl">✅</div>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {publishedCount}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">下書き</h3>
              <div className="text-2xl">📄</div>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{draftCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">総閲覧数</h3>
              <div className="text-2xl">👁️</div>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {totalViews.toLocaleString()}
            </p>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            クイックアクション
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/blog/new"
              className="flex items-center gap-4 p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition group"
            >
              <div className="bg-purple-100 text-purple-600 p-3 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">新規記事作成</h3>
                <p className="text-sm text-gray-600">SEO最適化された記事を書く</p>
              </div>
            </Link>

            <Link
              href="/admin/blog"
              className="flex items-center gap-4 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition group"
            >
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">記事管理</h3>
                <p className="text-sm text-gray-600">既存の記事を編集・削除</p>
              </div>
            </Link>

            <Link
              href="/blog"
              className="flex items-center gap-4 p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition group"
            >
              <div className="bg-green-100 text-green-600 p-3 rounded-lg group-hover:bg-green-600 group-hover:text-white transition">
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">ブログを見る</h3>
                <p className="text-sm text-gray-600">公開中の記事を確認</p>
              </div>
            </Link>
          </div>
        </div>

        {/* SEO戦略ガイド */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📊 SEO戦略ガイド
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-4">
              ブログのSEO最適化を進めるために、以下のステップを実行してください:
            </p>
            <ol className="space-y-2 mb-4">
              <li>
                <strong>Google Search Console</strong>
                に登録してサイトマップを送信
              </li>
              <li>
                <strong>一般的なキーワード</strong>
                で記事を作成（例: 「英語 勉強法」「プログラミング 初心者」）
              </li>
              <li>
                記事内に
                <strong>Books Fanの書籍へのリンク</strong>を含める
              </li>
              <li>
                SNSでシェアして
                <strong>初動のアクセスを獲得</strong>
              </li>
            </ol>
            <Link
              href="/docs/SEO_STRATEGY.md"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              詳細なSEO戦略を見る →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
