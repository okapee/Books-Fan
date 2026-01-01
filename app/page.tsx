"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ログイン済みの場合は本を探すページにリダイレクト
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/books");
    }
  }, [status, router]);

  // ローディング中は何も表示しない
  if (status === "loading" || status === "authenticated") {
    return null;
  }

  // 未ログインの場合はランディングページを表示
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
            本への愛を、
            <br />
            もっと深く、もっと広く。
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed">
            Books Fan は、本好きのためのレビュー&推薦プラットフォーム。
            <br />
            AIがあなたの読書体験を整理し、新しい本との出会いをサポートします。
          </p>
          <div className="flex flex-col gap-4 justify-center max-w-md mx-auto">
            <button
              onClick={() => signIn("google")}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Googleで無料登録
            </button>
            <button
              onClick={() => signIn("line")}
              className="bg-[#06C755] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#05b34c] transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              LINEで無料登録
            </button>
            <Link
              href="#features"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition text-center"
            >
              詳しく見る
            </Link>
          </div>
        </div>
      </section>

      {/* Reading Journey Section */}
      <section className="bg-gradient-to-b from-white to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            読書の旅を、完全サポート
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto text-lg">
            本と出会い、読書を管理し、知識を整理する。<br />
            あなたの読書ライフを一貫してサポートします。
          </p>

          <div className="max-w-6xl mx-auto">
            {/* Journey Steps */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Step 1: Discover */}
              <div className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-blue-200 h-full">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    1
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <span className="text-4xl">📚</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    本と出会う
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-center mb-4">
                    AIパーソナル推薦で、あなたにぴったりの本を発見。
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>フォローユーザーの人気本</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>カテゴリー別ランキング</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>AI推薦システム</span>
                    </li>
                  </ul>
                </div>
                {/* Arrow */}
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-300 text-4xl">
                  →
                </div>
              </div>

              {/* Step 2: Manage */}
              <div className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-green-200 h-full">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    2
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <span className="text-4xl">⏱️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    読書を管理
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-center mb-4">
                    ポモドーロタイマーで、読書時間を可視化。
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>25分集中タイマー</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>読書時間の自動記録</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>3つのステータス管理</span>
                    </li>
                  </ul>
                </div>
                {/* Arrow */}
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-green-300 text-4xl">
                  →
                </div>
              </div>

              {/* Step 3: Organize */}
              <div className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-purple-200 h-full">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    3
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <span className="text-4xl">🧠</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    知識を整理
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-center mb-4">
                    AIとマインドマップで、学びを可視化。
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>AI要約生成</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>マインドマップ自動作成</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>レビュー共有</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-6">
                <span className="font-bold text-blue-600">完全無料</span>で始められます
              </p>
              <Link
                href="#cta"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold hover:shadow-xl transition transform hover:-translate-y-0.5 text-lg"
              >
                今すぐ登録して始める →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
          充実の機能
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          読書をもっと楽しく、もっと深く。
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              レビューを書く
            </h3>
            <p className="text-gray-600 leading-relaxed">
              あなたの読書体験を言葉にしましょう。星評価とテキストで、本の魅力を伝えられます。
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              AI要点整理
            </h3>
            <p className="text-gray-600 leading-relaxed">
              あなたのレビューをAIが分析し、要点を箇条書きで整理。視覚的にも理解しやすく。
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              パーソナル推薦
            </h3>
            <p className="text-gray-600 leading-relaxed">
              あなたの読書傾向を分析し、次に読むべき一冊を提案します。
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">🗺️</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              マインドマップ
            </h3>
            <p className="text-gray-600 leading-relaxed">
              レビューから自動生成されるマインドマップで、読書の全体像を把握できます。
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">⏲️</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              ポモドーロタイマー
            </h3>
            <p className="text-gray-600 leading-relaxed">
              25分集中・5分休憩のサイクルで、効率的な読書習慣を身につけられます。
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              ソーシャル機能
            </h3>
            <p className="text-gray-600 leading-relaxed">
              フォローしたユーザーの読書記録やレビューを見て、新しい本との出会いを広げましょう。
            </p>
          </div>
        </div>
      </section>

      {/* Sample Reviews Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            読者の声
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Books Fanを使って、読書体験がどう変わったか見てみましょう
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Masahiro</h4>
                  <p className="text-sm text-gray-600">読書家</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                「AI要約機能が素晴らしい！レビューを書いた後、自動で要点をまとめてくれるので、後から見返すときにとても便利です。」
              </p>
              <div className="flex text-yellow-400">
                ★★★★★
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Sakura</h4>
                  <p className="text-sm text-gray-600">ビジネスパーソン</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                「忙しい日常の中でも、読んだ本の記録を簡単に残せます。パーソナル推薦機能で新しい本との出会いも増えました。」
              </p>
              <div className="flex text-yellow-400">
                ★★★★★
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            今すぐ始めよう
          </h2>
          <p className="text-xl mb-10 opacity-95 max-w-2xl mx-auto">
            無料アカウントを作成して、読書の世界を広げましょう。
            <br />
            クレジットカード不要、今すぐ始められます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <button
              onClick={() => signIn("google")}
              className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              onClick={() => signIn("line")}
              className="bg-white text-[#06C755] px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              LINE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
