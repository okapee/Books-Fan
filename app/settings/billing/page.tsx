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
    router.push("/");
    return null;
  }

  const isPremium = user?.membershipType === "PREMIUM";

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            請求設定
          </h1>
          <p className="text-gray-600">
            サブスクリプションと請求情報を管理
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-primary mb-6">
            現在のプラン
          </h2>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {isPremium ? "プレミアムプラン" : "無料プラン"}
              </div>
              {isPremium && (
                <div className="text-gray-600">
                  月額 ¥980（税込）
                </div>
              )}
            </div>

            {isPremium && (
              <div className="bg-accent text-primary px-4 py-2 rounded-full font-bold">
                PREMIUM
              </div>
            )}
          </div>

          {/* Subscription Status */}
          {isPremium && (
            <div className="space-y-4 mb-6 border-t pt-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">ステータス</span>
                <span
                  className={`font-semibold ${
                    user?.subscriptionStatus === "ACTIVE"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {user?.subscriptionStatus === "ACTIVE" ? "有効" : "更新待ち"}
                </span>
              </div>

              {user?.currentPeriodEnd && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">次回更新日</span>
                  <span className="text-gray-800">
                    {new Date(user.currentPeriodEnd).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-600">AI使用状況</span>
                <span className="text-gray-800">
                  {user?.aiUsageCount || 0} / 30 回
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-6 space-y-3">
            {isPremium ? (
              <button
                onClick={handleManageBilling}
                disabled={isLoading}
                className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
              >
                {isLoading ? "処理中..." : "サブスクリプションを管理"}
              </button>
            ) : (
              <Link
                href="/upgrade"
                className="block text-center w-full bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition"
              >
                プレミアムにアップグレード
              </Link>
            )}

            <Link
              href="/profile"
              className="block text-center w-full border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
            >
              プロフィールに戻る
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">ℹ️</div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                サブスクリプション管理について
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>
                  • 「サブスクリプションを管理」ボタンから、プランの変更やキャンセルができます
                </li>
                <li>
                  • 請求情報の変更や請求履歴の確認も同じページで行えます
                </li>
                <li>
                  • サブスクリプションをキャンセルしても、期間終了まで機能は利用できます
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
