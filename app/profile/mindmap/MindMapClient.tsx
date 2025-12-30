"use client";

import { useState, useEffect } from "react";
import { MindMap } from "@/components/mindmap/MindMap";
import {
  generateMindMapMarkdown,
  generateTimelineMindMap,
  generateRatingMindMap,
} from "@/lib/mindmap/generateMarkdown";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: Date;
  book: {
    title: string;
    author: string;
    categories: string[];
  };
  aiSummary?: {
    keyPoints: Array<{ point: string }>;
    summaryText: string;
  } | null;
}

interface MindMapClientProps {
  reviews: Review[];
  userName: string;
}

type MapType = "category" | "timeline" | "rating";

export function MindMapClient({ reviews, userName }: MindMapClientProps) {
  const [mapType, setMapType] = useState<MapType>("category");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // 年度のリストを取得
  const years = Array.from(
    new Set(
      reviews.map((r) => new Date(r.createdAt).getFullYear())
    )
  ).sort((a, b) => b - a);

  // 現在の年を初期値として設定
  useEffect(() => {
    if (years.length > 0 && selectedYear === null) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  // 選択された年でフィルタリング
  const filteredReviews = selectedYear
    ? reviews.filter(
        (r) => new Date(r.createdAt).getFullYear() === selectedYear
      )
    : reviews;

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📚</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          レビューがまだありません
        </h2>
        <p className="text-gray-700 mb-8">
          本のレビューを書くと、マインドマップで視覚化できます
        </p>
        <Link
          href="/books"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition inline-block"
        >
          本を探す
        </Link>
      </div>
    );
  }

  // マインドマップのMarkdownを生成
  const markdown =
    mapType === "category"
      ? generateMindMapMarkdown(userName, filteredReviews, selectedYear ?? undefined)
      : mapType === "timeline"
      ? generateTimelineMindMap(userName, filteredReviews, selectedYear ?? undefined)
      : generateRatingMindMap(userName, filteredReviews, selectedYear ?? undefined);

  return (
    <div className="space-y-6">
      {/* 年度選択 */}
      {years.length > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📅 年度</h2>
          <div className="flex flex-wrap gap-2">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  selectedYear === year
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {year}年 ({reviews.filter((r) => new Date(r.createdAt).getFullYear() === year).length}冊)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* マインドマップタイプ選択 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          マインドマップの種類
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setMapType("category")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              mapType === "category"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📂 カテゴリ別
          </button>
          <button
            onClick={() => setMapType("timeline")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              mapType === "timeline"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📅 タイムライン
          </button>
          <button
            onClick={() => setMapType("rating")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              mapType === "rating"
                ? "bg-amber-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ⭐ 評価別
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          {mapType === "category" &&
            "本をジャンル別に整理して表示します"}
          {mapType === "timeline" &&
            "最近読んだ本から順番に表示します"}
          {mapType === "rating" && "評価の高い順に本を整理して表示します"}
        </p>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {filteredReviews.length}
          </div>
          <div className="text-gray-600">レビュー数</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {
              new Set(filteredReviews.flatMap((r) => r.book.categories || [])).size
            }
          </div>
          <div className="text-gray-600">ジャンル数</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-3xl font-bold text-amber-600 mb-2">
            {filteredReviews.length > 0
              ? (
                  filteredReviews.reduce((sum, r) => sum + r.rating, 0) /
                  filteredReviews.length
                ).toFixed(1)
              : "0"}
          </div>
          <div className="text-gray-600">平均評価</div>
        </div>
      </div>

      {/* マインドマップ */}
      <MindMap markdown={markdown} userName={userName} />

      {/* プロフィールに戻る */}
      <div className="text-center">
        <Link
          href="/profile"
          className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          プロフィールに戻る
        </Link>
      </div>
    </div>
  );
}
