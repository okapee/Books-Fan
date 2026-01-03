"use client";

import { useState } from "react";

interface GenreSelectionPopupProps {
  isOpen: boolean;
  onComplete: (selectedGenres: string[]) => void;
}

// ジャンルリスト
const GENRES = [
  { id: "fiction", label: "文学・小説", icon: "📚", description: "文芸、ライトノベル、SF、ミステリーなど" },
  { id: "business", label: "ビジネス・経済", icon: "💼", description: "経営、マーケティング、投資、金融" },
  { id: "self-help", label: "自己啓発・人文", icon: "✨", description: "自己啓発、人文、思想、哲学" },
  { id: "technology", label: "科学・テクノロジー", icon: "🔬", description: "科学、技術、工学" },
  { id: "computer", label: "コンピュータ・IT", icon: "💻", description: "プログラミング、Web開発、AI" },
  { id: "history", label: "歴史・地理", icon: "🌍", description: "世界史、日本史、地理、紀行" },
  { id: "society", label: "社会・政治・法律", icon: "⚖️", description: "社会問題、政治、法律、経済学" },
  { id: "health", label: "医療・健康", icon: "🏥", description: "医学、薬学、健康、フィットネス" },
  { id: "art", label: "アート・デザイン", icon: "🎨", description: "美術、デザイン、建築、写真" },
  { id: "hobby", label: "趣味・実用", icon: "🎯", description: "料理、DIY、手芸、ガーデニング" },
  { id: "sports", label: "スポーツ", icon: "⚽", description: "スポーツ、アウトドア、武道" },
  { id: "lifestyle", label: "暮らし・子育て", icon: "🏠", description: "育児、家事、インテリア、ペット" },
  { id: "travel", label: "旅行", icon: "✈️", description: "旅行ガイド、地図、紀行文" },
  { id: "language", label: "語学・辞書", icon: "🗣️", description: "英語、外国語学習、辞書" },
  { id: "education", label: "教育・学参・受験", icon: "🎓", description: "教育、学習参考書、資格・就職" },
  { id: "comic", label: "コミック・マンガ", icon: "📖", description: "マンガ、コミックエッセイ" },
  { id: "children", label: "絵本・児童書", icon: "👶", description: "絵本、児童文学、知育" },
  { id: "entertainment", label: "エンタメ", icon: "🎬", description: "映画、音楽、ゲーム、タレント本" },
];

export function GenreSelectionPopup({ isOpen, onComplete }: GenreSelectionPopupProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [step, setStep] = useState<"intro" | "selection">("intro");

  if (!isOpen) return null;

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleContinue = () => {
    setStep("selection");
  };

  const handleComplete = () => {
    if (selectedGenres.length === 0) {
      alert("少なくとも1つのジャンルを選択してください");
      return;
    }
    onComplete(selectedGenres);
  };

  const handleSkip = () => {
    onComplete([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp">
        {step === "intro" ? (
          // イントロ画面
          <div className="p-4 sm:p-6 md:p-8 text-center">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">📚</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              ようこそ Books Fan へ！
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
              あなたの好きな本のジャンルを教えてください。
              <br />
              あなたにぴったりの本をおすすめします。
            </p>
            <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-xl mx-auto">
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                💡 ジャンルを選択すると、あなたの好みに合わせた本の推薦や、
                似た趣味を持つ読書仲間との出会いが広がります。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleContinue}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:shadow-xl transition transform hover:scale-105 whitespace-nowrap"
              >
                ジャンルを選択する
              </button>
              <button
                onClick={handleSkip}
                className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 transition whitespace-nowrap"
              >
                スキップ
              </button>
            </div>
          </div>
        ) : (
          // ジャンル選択画面
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
              好きなジャンルを選択してください
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              複数選択可能です。後から設定画面で変更できます。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition ${
                      isSelected
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className="text-2xl sm:text-3xl flex-shrink-0">{genre.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1">
                          {genre.label}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {genre.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <svg
                            className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="text-xs sm:text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left order-2 sm:order-1">
                {selectedGenres.length > 0 ? (
                  <span className="font-semibold text-purple-600">
                    {selectedGenres.length}個のジャンルを選択中
                  </span>
                ) : (
                  <span>少なくとも1つのジャンルを選択してください</span>
                )}
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
                <button
                  onClick={handleSkip}
                  className="border-2 border-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-50 transition text-sm sm:text-base whitespace-nowrap flex-1 sm:flex-none"
                >
                  スキップ
                </button>
                <button
                  onClick={handleComplete}
                  disabled={selectedGenres.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:shadow-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base whitespace-nowrap flex-1 sm:flex-none"
                >
                  完了
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
