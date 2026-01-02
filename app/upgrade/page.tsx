"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [promotionCode, setPromotionCode] = useState("");

  // 現在のユーザー情報を取得
  const { data: user } = trpc.user.getCurrent.useQuery(undefined, {
    enabled: !!session,
  });

  // Premium ステータスを取得（トライアル状態含む）
  const { data: premiumStatus } = trpc.user.getPremiumStatus.useQuery(
    undefined,
    {
      enabled: !!session,
    }
  );

  // トライアル開始のmutation
  const startTrialMutation = trpc.user.startPremiumTrial.useMutation({
    onSuccess: () => {
      alert("2週間無料トライアルを開始しました！");
      window.location.reload();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const isPremium = premiumStatus?.isPremium || user?.membershipType === "PREMIUM";
  const isTrialActive = premiumStatus?.isTrialActive || false;
  const hasUsedTrial = user?.premiumTrialStartedAt != null;

  const handleStartTrial = () => {
    if (!session) {
      router.push("/");
      return;
    }
    startTrialMutation.mutate();
  };

  const handleUpgrade = async () => {
    if (!session) {
      router.push("/");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promotionCode: promotionCode.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "エラーが発生しました";
        console.error("Checkout error response:", data);
        throw new Error(errorMsg);
      }

      // Stripe Checkoutにリダイレクト
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("チェックアウトURLが取得できませんでした");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      const errorMessage = error?.message || "エラーが発生しました。もう一度お試しください。";
      alert(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            プレミアム会員で読書体験をアップグレード
          </h1>
          <p className="text-xl text-gray-600">
            AI要約機能で、あなたのレビューをさらに効果的に
          </p>
        </div>

        {/* Current Status Banner (if logged in and premium) */}
        {isPremium && (
          <div className="bg-purple-100 border-2 border-purple-300 rounded-xl p-6 mb-8 text-center">
            {isTrialActive ? (
              <>
                <p className="text-xl font-bold text-purple-900 mb-2">
                  🎉 トライアル期間中です
                </p>
                <p className="text-purple-700 mb-2">
                  すべてのプレミアム機能をお試しいただけます
                </p>
                {premiumStatus?.trialEndsAt && (
                  <p className="text-sm text-purple-600">
                    トライアル終了日:{" "}
                    {new Date(premiumStatus.trialEndsAt).toLocaleDateString(
                      "ja-JP"
                    )}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-purple-900 mb-2">
                  ⭐ あなたは既にプレミアム会員です
                </p>
                <p className="text-purple-700">
                  すべてのプレミアム機能をお楽しみいただけます
                </p>
              </>
            )}
            <Link
              href="/profile"
              className="inline-block mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              プロフィールに戻る
            </Link>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                無料プラン
              </h2>
              <div className="text-5xl font-bold text-gray-600 mb-2">¥0</div>
              <p className="text-gray-600">永久無料</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">本の検索・閲覧</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">レビューの投稿・編集</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">お気に入り機能</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl">✗</span>
                <span className="text-gray-400">AI要約機能</span>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-semibold">
                現在のプラン
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-2xl p-8 border-2 border-purple-400 relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-purple-900 px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                おすすめ
              </span>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                プレミアムプラン
              </h2>
              <div className="text-5xl font-bold text-white mb-2">¥980</div>
              <p className="text-purple-200">月額（税込）</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-yellow-300 text-xl">✓</span>
                <span className="text-white font-semibold">
                  無料プランの全機能
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-300 text-xl">✓</span>
                <span className="text-white font-semibold">
                  AI要約機能（月30回まで）
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-300 text-xl">✓</span>
                <span className="text-white font-semibold">
                  優先サポート
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-300 text-xl">✓</span>
                <span className="text-white font-semibold">
                  新機能の優先アクセス
                </span>
              </div>
            </div>

            <div className="text-center space-y-3">
              {!session ? (
                <Link
                  href="/"
                  className="block bg-yellow-400 text-purple-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition shadow-lg"
                >
                  ログインして始める
                </Link>
              ) : isPremium ? (
                <div className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold">
                  ご利用中
                </div>
              ) : (
                <>
                  {/* トライアル未使用の場合はトライアルボタンを表示 */}
                  {!hasUsedTrial && (
                    <button
                      onClick={handleStartTrial}
                      disabled={startTrialMutation.isPending}
                      className="w-full bg-green-400 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-green-300 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {startTrialMutation.isPending
                        ? "処理中..."
                        : "🎉 2週間無料トライアル"}
                    </button>
                  )}

                  {/* プロモーションコード入力 */}
                  <div className="text-left">
                    <label
                      htmlFor="promotionCode"
                      className="block text-white/90 text-sm font-semibold mb-2"
                    >
                      プロモーションコード（任意）
                    </label>
                    <input
                      id="promotionCode"
                      type="text"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value)}
                      placeholder="例: 3MONTHS_FREE"
                      className="w-full px-4 py-2 rounded-lg border-2 border-white/30 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-yellow-300 focus:bg-white/20 transition"
                    />
                    <p className="text-white/70 text-xs mt-1">
                      クーポンコードをお持ちの方はこちらに入力してください
                    </p>
                  </div>

                  {/* 有料プランへのアップグレードボタン */}
                  <button
                    onClick={handleUpgrade}
                    disabled={isLoading}
                    className="w-full bg-yellow-400 text-purple-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "処理中..." : "今すぐアップグレード"}
                  </button>

                  {!hasUsedTrial && (
                    <p className="text-white/80 text-xs">
                      まずは無料トライアルをお試しください
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Corporate Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-xl shadow-2xl p-8 border-2 border-blue-400">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                法人プラン
              </h2>
              <div className="text-4xl font-bold text-white mb-1">¥30,000</div>
              <p className="text-blue-200 text-sm mb-2">月額（税込）</p>
              <p className="text-white text-sm font-semibold bg-white/20 inline-block px-3 py-1 rounded-full">
                最大100ユーザー
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-yellow-300 text-xl">✓</span>
                <span className="text-white font-semibold">
                  プレミアムの全機能
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-300 text-xl">✓</span>
                <span className="text-white font-semibold">
                  企業専用ワークスペース
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-300 text-xl">✓</span>
                <span className="text-white font-semibold">
                  社内限定の情報共有
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-300 text-xl">✓</span>
                <span className="text-white font-semibold">
                  AI要約無制限（企業全体）
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-300 text-xl">✓</span>
                <span className="text-white font-semibold">
                  管理者ダッシュボード
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-300 text-xl">✓</span>
                <span className="text-white font-semibold">
                  専任サポート
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-center bg-white/10 rounded-lg p-3">
                <p className="text-white text-sm mb-1">年間契約で</p>
                <p className="text-yellow-300 text-2xl font-bold">¥25,000/月</p>
                <p className="text-blue-200 text-xs">（年間¥60,000お得）</p>
              </div>

              {!session ? (
                <Link
                  href="/"
                  className="block w-full bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition shadow-lg text-center"
                >
                  ログインして始める
                </Link>
              ) : user?.companyId ? (
                <Link
                  href="/company/dashboard"
                  className="block w-full bg-white/20 text-white px-6 py-3 rounded-lg font-semibold text-center"
                >
                  ダッシュボードへ
                </Link>
              ) : (
                <Link
                  href="/company/register"
                  className="block w-full bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition shadow-lg text-center"
                >
                  企業登録を開始
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Features Comparison Table */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-primary text-center mb-8">
            機能比較表
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-gray-700">機能</th>
                  <th className="text-center py-4 px-4 text-gray-700">無料</th>
                  <th className="text-center py-4 px-4 text-purple-700 font-bold">
                    プレミアム
                  </th>
                  <th className="text-center py-4 px-4 text-blue-700 font-bold">
                    法人
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-800">本の検索・閲覧</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500 text-2xl">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500 text-2xl">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500 text-2xl">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-800">レビュー投稿</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500 text-2xl">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500 text-2xl">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500 text-2xl">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-800">お気に入り機能</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500 text-2xl">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500 text-2xl">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500 text-2xl">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-purple-50">
                  <td className="py-4 px-4 text-gray-800 font-semibold">
                    AI要約機能
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-500 text-2xl">✗</span>
                  </td>
                  <td className="text-center py-4 px-4 font-bold text-purple-700">
                    月30回
                  </td>
                  <td className="text-center py-4 px-4 font-bold text-blue-700">
                    無制限
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-800">社内限定共有</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-500 text-2xl">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-500 text-2xl">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500 text-2xl">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-800">管理者機能</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-500 text-2xl">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-500 text-2xl">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-500 text-2xl">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-800">サポート</td>
                  <td className="text-center py-4 px-4 text-gray-600 text-sm">
                    通常
                  </td>
                  <td className="text-center py-4 px-4 font-bold text-purple-700">
                    優先
                  </td>
                  <td className="text-center py-4 px-4 font-bold text-blue-700">
                    専任
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-800">ユーザー数</td>
                  <td className="text-center py-4 px-4 text-gray-600 text-sm">
                    1人
                  </td>
                  <td className="text-center py-4 px-4 text-gray-600 text-sm">
                    1人
                  </td>
                  <td className="text-center py-4 px-4 font-bold text-blue-700">
                    最大100人
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Feature Highlight */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-3xl font-bold text-primary mb-4">
                AI要約機能とは？
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                あなたが書いたレビューを、AIが自動で分析し、重要なポイントを箇条書きで要約します。
                長いレビューでも、読者が一目で内容を理解できるようになります。
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>レビューの要点を3つに自動抽出</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>読者の理解を助ける簡潔な要約</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>月30回まで利用可能</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <h4 className="font-semibold text-gray-900">AI要約</h4>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    PREMIUM
                  </span>
                </div>
                <div className="mt-3 text-gray-700 text-sm leading-relaxed">
                  - この本の世界観と設定が非常に魅力的<br />
                  - キャラクターの心理描写が深く共感できる<br />
                  - 結末に向けての展開が予想外で印象的
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center">
                実際のAI要約の表示例
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-8">
            よくある質問
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Q. 2週間無料トライアルとは何ですか？
              </h3>
              <p className="text-gray-700 pl-4">
                A. 初めての方限定で、プレミアム機能を2週間無料でお試しいただけます。トライアル期間中はすべてのプレミアム機能（AI要約30回/月）をご利用可能です。トライアル期間終了後、自動で有料プランに移行することはありません。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Q. トライアル終了後はどうなりますか？
              </h3>
              <p className="text-gray-700 pl-4">
                A. トライアル期間終了後は自動的に無料プランに戻ります。引き続きプレミアム機能をご利用されたい場合は、有料プランへのアップグレードをお願いします。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Q. いつでもキャンセルできますか？
              </h3>
              <p className="text-gray-700 pl-4">
                A. はい、いつでもキャンセル可能です。解約後も次回更新日まで引き続きプレミアム機能をご利用いただけます。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Q. 支払い方法は何がありますか？
              </h3>
              <p className="text-gray-700 pl-4">
                A. クレジットカード（Visa、Mastercard、American Express、JCB）でのお支払いが可能です。Stripeの安全な決済システムを使用しています。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Q. AI要約は何回まで使えますか？
              </h3>
              <p className="text-gray-700 pl-4">
                A. プレミアム会員は月30回までAI要約機能をご利用いただけます。毎月1日にカウントがリセットされます。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Q. 無料プランに戻すことはできますか？
              </h3>
              <p className="text-gray-700 pl-4">
                A. はい、いつでも無料プランに戻すことができます。プロフィールページから「プラン管理」でキャンセル手続きを行ってください。
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!isPremium && (
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">
                今すぐプレミアムを始めよう
              </h2>
              <p className="text-purple-100 mb-6 text-lg">
                月額たったの¥980で、AI要約機能が使い放題
              </p>
              {!session ? (
                <Link
                  href="/"
                  className="inline-block bg-yellow-400 text-purple-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-300 transition shadow-lg text-lg"
                >
                  ログインして始める
                </Link>
              ) : (
                <button
                  onClick={() => alert("Stripe決済機能は近日実装予定です")}
                  className="bg-yellow-400 text-purple-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-300 transition shadow-lg text-lg"
                >
                  今すぐアップグレード
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
