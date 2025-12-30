"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ReviewsPage() {
  const { data: session } = useSession();

  // 最新のレビューを取得（仮のクエリ、実装が必要）
  const { data: reviews, isLoading } = trpc.user.getCurrent.useQuery(undefined, {
    enabled: false, // TODO: レビュー一覧用のエンドポイントを作成する必要がある
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            レビュー
          </h1>
          <p className="text-xl text-gray-600">
            みんなの読書体験を見てみよう
          </p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📚</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            レビュー一覧機能
          </h2>
          <p className="text-gray-700 mb-8">
            現在、この機能は開発中です。
            <br />
            各書籍の詳細ページからレビューをご覧いただけます。
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/books"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              本を探す
            </Link>
            {session && (
              <Link
                href="/profile"
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
              >
                マイページ
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
