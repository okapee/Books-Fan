"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { data: user } = trpc.user.getCurrent.useQuery(undefined, {
    enabled: !!session,
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            ログインが必要です
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            請求設定にアクセスするには、ログインしてください。
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            ログインページへ
          </Link>
        </div>
      </div>
    );
  }

  const isPremium = user?.membershipType === "PREMIUM";
  const isTrialUser = isPremium && !user?.stripeCustomerId;
  const isPaidSubscriber = isPremium && !!user?.stripeCustomerId;

  const handleManageBilling = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "エラーが発生しました");
      }

      // Stripe顧客ポータルにリダイレクト
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal session error:", error);
      alert("エラーが発生しました。もう一度お試しください。");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-2">
            請求設定
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            サブスクリプションと請求情報を管理
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-primary mb-4 sm:mb-6">
            現在のプラン
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div>
              <div className="text-xl sm:text-3xl font-bold text-primary mb-2">
                {isPremium ? "プレミアムプラン" : "無料プラン"}
              </div>
              {isPremium && (
                <div className="text-sm sm:text-base text-gray-600">
                  月額 ¥980（税込）
                </div>
              )}
            </div>

            {isPremium && (
              <div className="bg-accent text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-sm sm:text-base self-start sm:self-auto">
                PREMIUM
              </div>
            )}
          </div>

          {/* Subscription Status */}
          {isPremium && (
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 border-t pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <span className="text-sm sm:text-base text-gray-600">ステータス</span>
                <span
                  className={`font-semibold text-sm sm:text-base ${
                    isTrialUser
                      ? "text-blue-600"
                      : user?.subscriptionStatus === "ACTIVE"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {isTrialUser
                    ? "トライアル中"
                    : user?.subscriptionStatus === "ACTIVE"
                    ? "有効"
                    : "更新待ち"}
                </span>
              </div>

              {isTrialUser && user?.premiumTrialEndsAt && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                  <span className="text-sm sm:text-base text-gray-600">トライアル終了日</span>
                  <span className="text-sm sm:text-base text-gray-800">
                    {new Date(user.premiumTrialEndsAt).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {isPaidSubscriber && user?.currentPeriodEnd && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                  <span className="text-sm sm:text-base text-gray-600">次回更新日</span>
                  <span className="text-sm sm:text-base text-gray-800">
                    {new Date(user.currentPeriodEnd).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <span className="text-sm sm:text-base text-gray-600">AI使用状況</span>
                <span className="text-sm sm:text-base text-gray-800">
                  {user?.aiUsageCount || 0} / 30 回
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-4 sm:pt-6 space-y-2 sm:space-y-3">
            {isPaidSubscriber ? (
              <button
                onClick={handleManageBilling}
                disabled={isLoading}
                className="w-full bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 text-sm sm:text-base"
              >
                {isLoading ? "処理中..." : "サブスクリプションを管理"}
              </button>
            ) : isTrialUser ? (
              <Link
                href="/upgrade"
                className="block text-center w-full bg-accent text-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-accent/90 transition text-sm sm:text-base"
              >
                有料プランにアップグレード
              </Link>
            ) : (
              <Link
                href="/upgrade"
                className="block text-center w-full bg-accent text-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-accent/90 transition text-sm sm:text-base"
              >
                プレミアムにアップグレード
              </Link>
            )}

            <Link
              href="/profile"
              className="block text-center w-full border-2 border-primary text-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-primary-50 transition text-sm sm:text-base"
            >
              プロフィールに戻る
            </Link>
          </div>
        </div>

        {/* Account Settings Link */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4">
            その他の設定
          </h2>
          <Link
            href="/settings/account"
            className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-primary transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-primary transition">
                  アカウント設定
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  アカウント情報の確認、退会手続き
                </div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-2xl sm:text-4xl">ℹ️</div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-2">
                {isTrialUser
                  ? "トライアルについて"
                  : isPaidSubscriber
                  ? "サブスクリプション管理について"
                  : "プレミアムプランについて"}
              </h3>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-1 sm:space-y-2">
                {isTrialUser ? (
                  <>
                    <li>
                      • トライアル期間中は、プレミアム機能を無料でお試しいただけます
                    </li>
                    <li>
                      • トライアル終了後は自動的に無料プランに戻ります（課金は発生しません）
                    </li>
                    <li>
                      • 有料プランにアップグレードすると、継続してプレミアム機能をご利用いただけます
                    </li>
                  </>
                ) : isPaidSubscriber ? (
                  <>
                    <li>
                      • 「サブスクリプションを管理」ボタンから、プランの変更やキャンセルができます
                    </li>
                    <li>
                      • 請求情報の変更や請求履歴の確認も同じページで行えます
                    </li>
                    <li>
                      • サブスクリプションをキャンセルしても、期間終了まで機能は利用できます
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      • プレミアムプランでは、AI要約機能が月30回まで使えます
                    </li>
                    <li>
                      • その他、今後追加される新機能も優先的にご利用いただけます
                    </li>
                    <li>
                      • 月額980円（税込）でご利用いただけます
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
