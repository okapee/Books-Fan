"use client";

import { useState } from "react";
import Link from "next/link";

interface PremiumUpgradePopupProps {
  isOpen: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

export function PremiumUpgradePopup({ isOpen, onClose }: PremiumUpgradePopupProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose(dontShowAgain);
  };

  const features = [
    {
      icon: "🤖",
      title: "AI要約",
      description: "レビューや本の内容をAIが自動で要約",
      highlight: "月30回まで利用可能",
    },
    {
      icon: "🗺️",
      title: "マインドマップ",
      description: "読書記録を視覚的に整理・可視化",
      highlight: "カテゴリ別・評価別に自動生成",
    },
    {
      icon: "📊",
      title: "詳細な分析",
      description: "読書傾向や統計を詳しく分析",
      highlight: "インサイト機能",
    },
    {
      icon: "⭐",
      title: "優先サポート",
      description: "問い合わせに優先的に対応",
      highlight: "専用サポート",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 sm:p-6 md:p-8 rounded-t-xl sm:rounded-t-2xl">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80 hover:text-white transition"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <div className="inline-block bg-yellow-400 text-purple-900 text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full mb-3 sm:mb-4">
              PREMIUM限定
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              読書体験をアップグレード
            </h2>
            <p className="text-white/90 text-sm sm:text-base md:text-lg">
              プレミアムプランで、さらに充実した読書ライフを
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-100 hover:shadow-lg transition"
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{feature.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-2">
                  {feature.description}
                </p>
                <div className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded">
                  {feature.highlight}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-yellow-200 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">今すぐ始める</p>
                <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                  <span className="text-3xl sm:text-4xl font-bold text-purple-600">¥980</span>
                  <span className="text-sm sm:text-base text-gray-600">/月</span>
                </div>
              </div>
              <Link
                href="/upgrade"
                onClick={handleClose}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:shadow-xl transition transform hover:scale-105 text-center"
              >
                アップグレード
              </Link>
            </div>
          </div>

          {/* Don't Show Again Checkbox */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-200">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="dontShowAgain" className="text-sm text-gray-600 cursor-pointer">
              しばらく表示しない（7日間）
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
