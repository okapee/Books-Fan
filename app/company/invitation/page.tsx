"use client";

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CompanyInvitationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const acceptInvitationMutation = trpc.company.acceptInvitation.useMutation();

  useEffect(() => {
    if (!token) {
      setError("招待トークンが見つかりません");
    }
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!token) return;
    if (!session) {
      // ログインページにリダイレクト（招待トークンを保持）
      router.push(
        `/auth/signin?callbackUrl=${encodeURIComponent(
          `/company/invitation?token=${token}`
        )}`
      );
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      const company = await acceptInvitationMutation.mutateAsync({ token });
      setSuccess(true);
      setTimeout(() => {
        router.push("/company/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "招待の受諾に失敗しました");
      setAccepting(false);
    }
  };

  // 認証チェック中
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // エラーがある場合
  if (error && !accepting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              エラーが発生しました
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 受諾成功
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              招待を受諾しました！
            </h1>
            <p className="text-gray-600 mb-6">
              企業アカウントに追加されました。ダッシュボードに移動します...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // 招待受諾画面
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* アイコン */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📨</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              企業への招待
            </h1>
            <p className="text-gray-600">
              企業アカウントに招待されています
            </p>
          </div>

          {/* 説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2">この招待を受諾すると:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>企業メンバーとして登録されます</li>
                  <li>企業内でコンテンツを共有できます</li>
                  <li>AI要約機能などの法人向け機能が使えます</li>
                  <li>現在のアカウントが法人アカウントに変更されます</li>
                </ul>
              </div>
            </div>
          </div>

          {/* アクション */}
          {!session ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                招待を受諾するにはログインが必要です
              </p>
              <button
                onClick={handleAcceptInvitation}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition"
              >
                ログインして受諾
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 text-center">
                <p className="mb-1">ログイン中:</p>
                <p className="font-semibold">{session.user?.email}</p>
              </div>
              <button
                onClick={handleAcceptInvitation}
                disabled={accepting}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {accepting ? "処理中..." : "招待を受諾"}
              </button>
              <button
                onClick={() => router.push("/")}
                disabled={accepting}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
