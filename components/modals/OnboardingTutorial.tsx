"use client";

import { useState } from "react";
import Link from "next/link";

interface OnboardingTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function OnboardingTutorial({ isOpen, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Books Fanへようこそ！",
      description: "本好きのためのレビュー＆推薦プラットフォームです",
      icon: "📚",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 text-lg">
            Books Fanは、読書体験をより豊かにするためのプラットフォームです。
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">主な機能</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                本のレビュー投稿・閲覧
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                読書管理（読みたい・読書中・読了）
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                ポモドーロタイマーで読書記録
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                ユーザーフォロー機能
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                AI要約・マインドマップ（プレミアム）
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "本を探してレビューを書く",
      description: "読んだ本の感想を記録しましょう",
      icon: "✍️",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
              <div className="text-2xl sm:text-3xl mb-2">🔍</div>
              <h4 className="font-semibold text-sm sm:text-base text-purple-900 mb-2">1. 本を検索</h4>
              <p className="text-xs sm:text-sm text-purple-800">
                「本を探す」から読んだ本を検索できます
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
              <div className="text-2xl sm:text-3xl mb-2">⭐</div>
              <h4 className="font-semibold text-sm sm:text-base text-green-900 mb-2">2. レビューを投稿</h4>
              <p className="text-xs sm:text-sm text-green-800">
                評価と感想を書いて投稿しましょう
              </p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            💡 ヒント: レビューは30文字以上で投稿できます
          </p>
        </div>
      ),
    },
    {
      title: "読書を管理・記録する",
      description: "ポモドーロタイマーで読書習慣を身につけよう",
      icon: "📖",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
              <div className="text-2xl sm:text-3xl mb-2">📚</div>
              <h4 className="font-semibold text-sm sm:text-base text-blue-900 mb-2">読みたい</h4>
              <p className="text-xs sm:text-sm text-blue-800">
                気になる本をリストに追加
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
              <div className="text-2xl sm:text-3xl mb-2">📖</div>
              <h4 className="font-semibold text-sm sm:text-base text-green-900 mb-2">読書中</h4>
              <p className="text-xs sm:text-sm text-green-800">
                今読んでいる本を管理
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
              <div className="text-2xl sm:text-3xl mb-2">✅</div>
              <h4 className="font-semibold text-sm sm:text-base text-purple-900 mb-2">読了</h4>
              <p className="text-xs sm:text-sm text-purple-800">
                読み終えた本を記録
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-4xl">⏱️</div>
              <div>
                <h4 className="font-bold text-lg text-orange-900">ポモドーロタイマー</h4>
                <p className="text-sm text-orange-700">
                  25分集中 + 5分休憩で効率的な読書
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              読書セッションを自動記録し、継続日数や総読書時間を確認できます
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "プレミアム機能を活用",
      description: "AI要約とマインドマップで読書を可視化",
      icon: "⭐",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">🤖</div>
              <div>
                <h4 className="font-bold text-lg text-purple-900">AI要約</h4>
                <p className="text-sm text-purple-700">
                  レビューや本の内容を自動で要約
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                月30回まで利用可能で、主要なポイントを自動抽出します
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">🗺️</div>
              <div>
                <h4 className="font-bold text-lg text-green-900">マインドマップ</h4>
                <p className="text-sm text-green-700">
                  読書記録を視覚的に整理
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">
                カテゴリ別・評価別・タイムラインで自動生成され、PNG/SVGでダウンロード可能
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-center text-yellow-800 font-semibold">
              月額 ¥500 でこれらの機能が使い放題！
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "さあ、始めましょう！",
      description: "準備は完了です",
      icon: "🚀",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-xl text-gray-700 font-semibold">
            これでBooks Fanの使い方がわかりました！
          </p>
          <p className="text-gray-600">
            早速、本を探してレビューを書いてみましょう
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Link
              href="/books"
              onClick={onComplete}
              className="bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition text-center text-sm sm:text-base"
            >
              📖 本を探す
            </Link>
            <Link
              href="/reading"
              onClick={onComplete}
              className="bg-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-green-700 transition text-center text-sm sm:text-base"
            >
              📚 読書管理
            </Link>
            <Link
              href="/upgrade"
              onClick={onComplete}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition text-center text-sm sm:text-base"
            >
              ⭐ プレミアム
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Progress Bar */}
        <div className="bg-gray-100 h-2 rounded-t-xl sm:rounded-t-2xl">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-tl-xl sm:rounded-tl-2xl transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="text-center p-4 sm:p-6 md:p-8 border-b border-gray-200">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">{currentStepData.icon}</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            {currentStepData.description}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex items-center gap-1.5 sm:gap-2 order-2 sm:order-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 sm:h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-6 sm:w-8 bg-purple-600"
                    : index < currentStep
                    ? "w-1.5 sm:w-2 bg-purple-400"
                    : "w-1.5 sm:w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="text-gray-600 hover:text-gray-900 px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base whitespace-nowrap"
              >
                スキップ
              </button>
            )}
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="border-2 border-gray-300 text-gray-700 px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition text-sm sm:text-base whitespace-nowrap flex-1 sm:flex-none"
              >
                戻る
              </button>
            )}
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-2 rounded-lg font-semibold hover:shadow-lg transition text-sm sm:text-base whitespace-nowrap flex-1 sm:flex-none"
            >
              {isLastStep ? "始める" : "次へ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
