"use client";

import Link from "next/link";

interface TrialExpiredPopupProps {
  isOpen: boolean;
  onClose: () => void;
  trialEndsAt?: Date | null;
}

export function TrialExpiredPopup({ isOpen, onClose, trialEndsAt }: TrialExpiredPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-3xl font-bold mb-2">
              プレミアムトライアルが終了しました
            </h2>
            <p className="text-white/90 text-lg">
              引き続きプレミアム機能をご利用いただくには、アップグレードが必要です
            </p>
            {trialEndsAt && (
              <p className="text-white/80 text-sm mt-2">
                トライアル終了日: {new Date(trialEndsAt).toLocaleDateString("ja-JP")}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Lost Features */}
          <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200 mb-6">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🚫</span>
              現在ご利用いただけない機能
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-red-600 mt-1">✗</span>
                <div>
                  <p className="font-semibold text-red-900">AI要約機能</p>
                  <p className="text-sm text-red-700">レビューや本の内容をAIが自動で要約</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 mt-1">✗</span>
                <div>
                  <p className="font-semibold text-red-900">マインドマップ生成</p>
                  <p className="text-sm text-red-700">読書記録を視覚的に整理・可視化</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 mt-1">✗</span>
                <div>
                  <p className="font-semibold text-red-900">詳細な分析機能</p>
                  <p className="text-sm text-red-700">読書傾向や統計の詳細分析</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Benefits of Upgrading */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 mb-6">
            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              プレミアムプランで引き続きご利用いただける特典
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">AI要約（月30回）</p>
                  <p className="text-sm text-gray-600">効率的な読書体験</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">マインドマップ</p>
                  <p className="text-sm text-gray-600">自動生成＆ダウンロード</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">詳細分析</p>
                  <p className="text-sm text-gray-600">読書傾向の可視化</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">優先サポート</p>
                  <p className="text-sm text-gray-600">専用サポート対応</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 border-2 border-orange-300 mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-700 mb-2">特別価格</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-purple-600">¥500</span>
                <span className="text-xl text-gray-600">/月</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                いつでもキャンセル可能
              </p>
            </div>

            <Link
              href="/upgrade"
              onClick={onClose}
              className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center px-8 py-4 rounded-xl font-bold text-xl hover:shadow-2xl transition transform hover:scale-105"
            >
              今すぐプレミアムにアップグレード
            </Link>
          </div>

          {/* Close Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-sm transition"
            >
              後で確認する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
