"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useState } from "react";

export function TrialExpiredBanner() {
  const { data: session } = useSession();
  const [isDismissed, setIsDismissed] = useState(false);

  // Get premium status to check trial expiration
  const { data: premiumStatus } = trpc.user.getPremiumStatus.useQuery(undefined, {
    enabled: !!session?.user,
  });

  if (!session?.user || !premiumStatus) return null;

  const now = new Date();
  const isTrialExpired =
    premiumStatus.trialEndsAt &&
    new Date(premiumStatus.trialEndsAt) < now &&
    !premiumStatus.isSubscriptionActive;

  if (!isTrialExpired || isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 relative">
      <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⏰</span>
          <div>
            <p className="font-bold">プレミアムトライアルが終了しました</p>
            <p className="text-sm text-white/90">
              AI要約やマインドマップなどの機能をご利用いただくには、プレミアムプランへのアップグレードが必要です
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/upgrade"
            className="bg-white text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-50 transition whitespace-nowrap"
          >
            今すぐアップグレード
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-white/80 hover:text-white transition"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
