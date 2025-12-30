"use client";

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function CompanyDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

  const { data: company, isLoading: companyLoading } =
    trpc.company.getCompanyInfo.useQuery();
  const { data: members, isLoading: membersLoading } =
    trpc.company.getMembers.useQuery();
  const { data: invitations, isLoading: invitationsLoading } =
    trpc.company.getInvitations.useQuery();
  const { data: stats, isLoading: statsLoading } =
    trpc.company.getUsageStats.useQuery();

  const inviteUserMutation = trpc.company.inviteUser.useMutation();
  const removeMemberMutation = trpc.company.removeMember.useMutation();
  const updateRoleMutation = trpc.company.updateMemberRole.useMutation();
  const createCheckoutSessionMutation =
    trpc.company.createCheckoutSession.useMutation();
  const createPortalSessionMutation =
    trpc.company.createPortalSession.useMutation();

  const utils = trpc.useUtils();

  // 認証チェック
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  // ユーザー招待
  const handleInviteUser = async () => {
    if (!inviteEmail) return;

    try {
      await inviteUserMutation.mutateAsync({
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteRole("MEMBER");
      utils.company.getInvitations.invalidate();
      alert("招待メールを送信しました");
    } catch (error: any) {
      alert(error.message || "招待に失敗しました");
    }
  };

  // メンバー削除
  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!confirm(`${userName}を削除しますか？`)) return;

    try {
      await removeMemberMutation.mutateAsync({ userId });
      utils.company.getMembers.invalidate();
      alert("メンバーを削除しました");
    } catch (error: any) {
      alert(error.message || "削除に失敗しました");
    }
  };

  // ロール変更
  const handleUpdateRole = async (
    userId: string,
    newRole: "ADMIN" | "MEMBER"
  ) => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      utils.company.getMembers.invalidate();
      alert("ロールを変更しました");
    } catch (error: any) {
      alert(error.message || "変更に失敗しました");
    }
  };

  // サブスクリプション開始
  const handleStartSubscription = async () => {
    try {
      const { url } = await createCheckoutSessionMutation.mutateAsync();
      window.location.href = url;
    } catch (error: any) {
      alert(error.message || "チェックアウトセッションの作成に失敗しました");
    }
  };

  // サブスクリプション管理
  const handleManageSubscription = async () => {
    try {
      const { url } = await createPortalSessionMutation.mutateAsync();
      window.location.href = url;
    } catch (error: any) {
      alert(error.message || "ポータルセッションの作成に失敗しました");
    }
  };

  if (companyLoading || membersLoading || invitationsLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">
            企業アカウントが見つかりません
          </h1>
          <p className="text-gray-600 mb-6">
            まだ企業アカウントを作成していません。
          </p>
          <Link
            href="/company/register"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition"
          >
            企業アカウントを作成
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {company.name}
        </h1>
        <p className="text-gray-600">企業管理ダッシュボード</p>
      </div>

      {/* ナビゲーションタブ */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex gap-8">
          <Link
            href="/company/dashboard"
            className="pb-4 border-b-2 border-primary text-primary font-semibold"
          >
            ダッシュボード
          </Link>
          <Link
            href="/company/feed"
            className="pb-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
          >
            社内フィード
          </Link>
          <Link
            href="/company/reports"
            className="pb-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
          >
            統計レポート
          </Link>
        </nav>
      </div>

      {/* 統計カード */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600">メンバー数</h3>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {stats?.users.current || 0}
            <span className="text-lg text-gray-400">
              {" "}
              / {stats?.users.max || 100}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600">AI使用回数</h3>
            <span className="text-2xl">🤖</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {stats?.aiUsage.current || 0}
            <span className="text-lg text-gray-400">
              {" "}
              / {stats?.aiUsage.limit || 1000}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            リセット:{" "}
            {stats?.aiUsage.resetDate
              ? new Date(stats.aiUsage.resetDate).toLocaleDateString("ja-JP")
              : "-"}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600">
              今月のレビュー
            </h3>
            <span className="text-2xl">📝</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {stats?.reviews.thisMonth || 0}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* メンバー管理 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">メンバー管理</h2>

          {/* ユーザー招待フォーム */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold mb-3">新しいメンバーを招待</h3>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="メールアドレス"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="flex gap-2">
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "ADMIN" | "MEMBER")
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="MEMBER">メンバー</option>
                  <option value="ADMIN">管理者</option>
                </select>
                <button
                  onClick={handleInviteUser}
                  disabled={!inviteEmail || inviteUserMutation.isPending}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviteUserMutation.isPending ? "送信中..." : "招待"}
                </button>
              </div>
            </div>
          </div>

          {/* メンバーリスト */}
          <div className="space-y-3">
            {members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name || "User"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {member.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {member.name || "名前なし"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {member.email}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      member.companyRole === "ADMIN"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {member.companyRole === "ADMIN" ? "管理者" : "メンバー"}
                  </span>
                  {member.id !== session?.user?.id && (
                    <button
                      onClick={() =>
                        handleRemoveMember(member.id, member.name || "ユーザー")
                      }
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 招待管理 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">招待管理</h2>

          {invitations && invitations.length > 0 ? (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {invitation.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        {invitation.role === "ADMIN" ? "管理者" : "メンバー"}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        invitation.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : invitation.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {invitation.status === "PENDING"
                        ? "保留中"
                        : invitation.status === "ACCEPTED"
                        ? "承認済み"
                        : "期限切れ"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    有効期限:{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString("ja-JP")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>招待はありません</p>
            </div>
          )}
        </div>
      </div>

      {/* 企業設定セクション */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">企業情報</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              企業名
            </label>
            <div className="text-lg">{company.name}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              スラッグ
            </label>
            <div className="text-lg font-mono">{company.slug}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ドメイン
            </label>
            <div className="text-lg">{company.domain || "未設定"}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              契約タイプ
            </label>
            <div className="text-lg">
              {company.contractType === "MONTHLY" ? "月額" : "年額"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              公開コンテンツ設定
            </label>
            <div className="text-lg">
              {company.allowPublicContent ? "許可" : "企業内のみ"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              サブスクリプション状態
            </label>
            <div className="text-lg">
              {company.subscriptionStatus === "ACTIVE"
                ? "有効"
                : company.subscriptionStatus === "NONE"
                ? "未設定"
                : company.subscriptionStatus}
            </div>
          </div>
        </div>
      </div>

      {/* サブスクリプション管理 */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">サブスクリプション管理</h2>

        {company.subscriptionStatus === "NONE" ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💳</div>
            <p className="text-gray-600 mb-6">
              サブスクリプションがまだ設定されていません
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <div className="text-left">
                <p className="font-semibold text-gray-900 mb-2">
                  {company.contractType === "MONTHLY" ? "月額プラン" : "年額プラン"}
                </p>
                <p className="text-3xl font-bold text-primary mb-1">
                  {company.contractType === "MONTHLY"
                    ? "¥30,000"
                    : "¥25,000"}
                  <span className="text-sm text-gray-600">/月</span>
                </p>
                <p className="text-sm text-gray-600">
                  最大{company.maxUsers}ユーザー、AI使用月1000回
                </p>
              </div>
            </div>
            <button
              onClick={handleStartSubscription}
              disabled={createCheckoutSessionMutation.isPending}
              className="px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createCheckoutSessionMutation.isPending
                ? "処理中..."
                : "サブスクリプションを開始"}
            </button>
          </div>
        ) : (
          <div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  ステータス
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      company.subscriptionStatus === "ACTIVE"
                        ? "bg-green-500"
                        : company.subscriptionStatus === "PAST_DUE"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-lg font-semibold">
                    {company.subscriptionStatus === "ACTIVE"
                      ? "有効"
                      : company.subscriptionStatus === "PAST_DUE"
                      ? "支払い遅延"
                      : company.subscriptionStatus === "CANCELED"
                      ? "キャンセル済み"
                      : company.subscriptionStatus}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  次回更新日
                </label>
                <div className="text-lg font-semibold">
                  {company.currentPeriodEnd
                    ? new Date(company.currentPeriodEnd).toLocaleDateString(
                        "ja-JP"
                      )
                    : "未設定"}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleManageSubscription}
                disabled={
                  createPortalSessionMutation.isPending ||
                  !company.stripeCustomerId
                }
                className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPortalSessionMutation.isPending
                  ? "処理中..."
                  : "サブスクリプションを管理"}
              </button>
              <p className="text-sm text-gray-600 flex items-center">
                請求履歴の確認、支払い方法の変更、キャンセルなど
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
