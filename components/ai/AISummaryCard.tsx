"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { MindMap } from "@/components/mindmap/MindMap";
import { generateReviewMindMap } from "@/lib/mindmap/generateMarkdown";

interface AISummaryCardProps {
  reviewId: string;
  isPremiumUser?: boolean;
  showGenerateButton?: boolean;
  bookTitle?: string;
}

export function AISummaryCard({
  reviewId,
  isPremiumUser = false,
  showGenerateButton = true,
  bookTitle = "書籍",
}: AISummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);

  // 既存の要約を取得
  const {
    data: summary,
    isLoading: summaryLoading,
    refetch,
  } = trpc.aiSummary.getByReviewId.useQuery({
    reviewId,
  });

  // 要約生成ミューテーション
  const generateSummary = trpc.aiSummary.generate.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleGenerate = () => {
    if (!isPremiumUser) {
      alert("プレミアム会員のみ利用可能な機能です");
      return;
    }
    generateSummary.mutate({ reviewId });
  };

  // 要約が存在しない場合
  if (!summary && !showGenerateButton) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      {summary ? (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <h4 className="font-semibold text-gray-900">AI要約</h4>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                PREMIUM
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? "折りたたむ" : "展開する"}
            </button>
          </div>

          {isExpanded && (
            <>
              <div className="mt-3 text-gray-700 whitespace-pre-line leading-relaxed">
                {summary.summaryText}
              </div>

              {/* Key Points */}
              {summary.keyPoints && Array.isArray(summary.keyPoints) && summary.keyPoints.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-semibold text-gray-900 mb-2">主要なポイント：</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {summary.keyPoints.map((kp: any, idx: number) => (
                      <li key={idx}>{typeof kp === 'string' ? kp : (kp?.point || '')}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mind Map Toggle Button */}
              <div className="mt-4">
                <button
                  onClick={() => setShowMindMap(!showMindMap)}
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {showMindMap ? "マインドマップを隠す" : "マインドマップを表示"}
                </button>
              </div>

              {/* Mind Map Display */}
              {showMindMap && (
                <div className="mt-4">
                  <MindMap
                    markdown={
                      // AI生成のマインドマップ構造を優先
                      summary.visualizationData &&
                      typeof summary.visualizationData === 'object' &&
                      'mindmap' in summary.visualizationData &&
                      typeof summary.visualizationData.mindmap === 'string'
                        ? summary.visualizationData.mindmap
                        : // フォールバック: keyPointsから生成
                          summary.keyPoints && Array.isArray(summary.keyPoints) && summary.keyPoints.length > 0
                          ? generateReviewMindMap(
                              {
                                keyPoints: summary.keyPoints.map((kp: any) =>
                                  typeof kp === 'string' ? { point: kp } : kp
                                ),
                                summaryText: summary.summaryText,
                              },
                              bookTitle
                            )
                          : `# ${bookTitle}\n\n## マインドマップデータがありません`
                    }
                    userName=""
                  />
                </div>
              )}
            </>
          )}

          {!isExpanded && (
            <p className="text-sm text-gray-600 mt-2">
              このレビューのAI要約が生成されています
            </p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base sm:text-lg">🤖</span>
                <h4 className="font-semibold text-sm sm:text-base text-gray-900">AI要約</h4>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 sm:py-1 rounded-full">
                  PREMIUM
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                {isPremiumUser
                  ? "このレビューのAI要約を生成できます"
                  : "プレミアム会員になるとAI要約を利用できます"}
              </p>
            </div>

            {isPremiumUser && showGenerateButton && (
              <button
                onClick={handleGenerate}
                disabled={generateSummary.isPending || summaryLoading}
                className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 sm:py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
              >
                {generateSummary.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    生成中...
                  </span>
                ) : (
                  "要約を生成"
                )}
              </button>
            )}
          </div>

          {generateSummary.error && (
            <div className="mt-3 text-sm text-red-600">
              エラー: {generateSummary.error.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
