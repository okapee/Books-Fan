"use client";

import { trpc } from "@/lib/trpc";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // ユーザー情報取得
  const { data: user } = trpc.user.getCurrent.useQuery(undefined, {
    enabled: !!session,
  });

  // アカウント削除ミューテーション
  const deleteAccount = trpc.user.deleteAccount.useMutation({
    onSuccess: async (data) => {
      if (data.subscriptionCancelled && data.currentPeriodEnd) {
        const periodEnd = new Date(data.currentPeriodEnd).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        alert(
          `アカウントを削除しました。\n\nサブスクリプションは ${periodEnd} まで有効で、それ以降は自動的にキャンセルされます。\n\nご利用ありがとうございました。`
        );
      } else {
        alert("アカウントを削除しました。ご利用ありがとうございました。");
      }
      // ログアウトしてトップページへ
      await signOut({ redirect: false });
      router.push("/");
    },
    onError: (error) => {
      alert(`削除に失敗しました: ${error.message}`);
      setIsDeleting(false);
    },
  });

  const handleDeleteAccount = () => {
    if (confirmationText !== "DELETE") {
      alert('「DELETE」と入力してください');
      return;
    }

    if (
      !confirm(
        "本当にアカウントを削除しますか？この操作は取り消せません。すべてのデータ（レビュー、お気に入り、フォロー情報など）が完全に削除されます。"
      )
    ) {
      return;
    }

    setIsDeleting(true);
    deleteAccount.mutate({ confirmation: confirmationText });
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            ログインが必要です
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            アカウント設定にアクセスするには、ログインしてください。
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

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center text-sm sm:text-base text-primary hover:underline mb-4"
          >
            ← プロフィールに戻る
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            アカウント設定
          </h1>
        </div>

        {/* Account Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            アカウント情報
          </h2>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-3">
              <span className="text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-0 sm:w-32">
                メールアドレス
              </span>
              <span className="text-sm sm:text-base text-gray-900 break-all">
                {user?.email || "未設定"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-3">
              <span className="text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-0 sm:w-32">
                ユーザー名
              </span>
              <span className="text-sm sm:text-base text-gray-900">
                {user?.name || "未設定"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-3">
              <span className="text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-0 sm:w-32">
                会員タイプ
              </span>
              <span className="text-sm sm:text-base">
                <span
                  className={`px-3 py-1 rounded-full font-semibold ${
                    user?.membershipType === "PREMIUM"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {user?.membershipType === "PREMIUM" ? "PREMIUM" : "FREE"}
                </span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-0 sm:w-32">
                登録日
              </span>
              <span className="text-sm sm:text-base text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "不明"}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/profile/edit"
              className="w-full sm:w-auto inline-block text-center bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              プロフィールを編集
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-red-200">
          <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-3 sm:mb-4">
            危険な操作
          </h2>

          <div className="bg-red-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
              アカウントの削除
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 leading-relaxed">
              アカウントを削除すると、以下のデータがすべて完全に削除されます：
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-gray-700 space-y-1 sm:space-y-2 mb-4 sm:mb-6">
              <li>投稿したすべてのレビュー</li>
              <li>お気に入りの本</li>
              <li>読書ステータス</li>
              <li>AI要約データ</li>
              <li>フォロー・フォロワー情報</li>
              <li>通知履歴</li>
              <li>その他すべてのアクティビティ</li>
            </ul>

            {/* PREMIUM会員の場合の課金に関する注意事項 */}
            {user?.membershipType === "PREMIUM" && user?.currentPeriodEnd && (
              <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200 mb-4">
                <p className="text-xs sm:text-sm font-semibold text-purple-900 mb-2">
                  💳 サブスクリプションについて
                </p>
                <p className="text-xs sm:text-sm text-purple-800 leading-relaxed">
                  現在の課金期間（
                  {new Date(user.currentPeriodEnd).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  まで）は引き続き有効で、その期間終了後に自動的にキャンセルされます。
                  次回以降の課金は発生しません。
                </p>
              </div>
            )}

            <div className="bg-white rounded-lg p-3 sm:p-4 border border-red-200 mb-4">
              <p className="text-xs sm:text-sm font-semibold text-red-700">
                ⚠️ この操作は取り消すことができません
              </p>
            </div>

            {!showDeleteConfirmation ? (
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="w-full sm:w-auto bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-red-700 transition text-sm sm:text-base"
              >
                アカウントを削除する
              </button>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label
                    htmlFor="confirmation"
                    className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2"
                  >
                    本当に削除する場合は、以下に「<span className="text-red-600">DELETE</span>」と入力してください：
                  </label>
                  <input
                    type="text"
                    id="confirmation"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    disabled={isDeleting}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={
                      confirmationText !== "DELETE" || isDeleting
                    }
                    className="w-full sm:flex-1 bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isDeleting ? "削除中..." : "完全に削除する"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirmation(false);
                      setConfirmationText("");
                    }}
                    disabled={isDeleting}
                    className="w-full sm:flex-1 bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 text-sm sm:text-base"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
