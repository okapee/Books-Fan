"use client";

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompanyRegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    domain: "",
    maxUsers: 100,
    contractType: "MONTHLY" as "MONTHLY" | "ANNUAL",
  });

  const createCompanyMutation = trpc.company.createCompany.useMutation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCompanyMutation.mutateAsync(formData);
      alert("企業アカウントを作成しました");
      router.push("/company/dashboard");
    } catch (error: any) {
      alert(error.message || "作成に失敗しました");
    }
  };

  const handleSlugChange = (value: string) => {
    // スラッグは小文字の英数字とハイフンのみ
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData({ ...formData, slug: sanitized });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            企業アカウント登録
          </h1>
          <p className="text-gray-600">
            法人向けプランで最大100名まで利用可能
          </p>
        </div>

        {/* プライシング情報 */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">法人プラン</h2>
            <div className="text-4xl font-bold mb-1">¥30,000</div>
            <p className="text-blue-200 text-sm">月額（税込）</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>最大100ユーザー</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>企業内コンテンツ共有</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>AI要約機能（月1000回）</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>使用状況レポート</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20 text-center">
            <p className="text-sm text-blue-200 mb-1">年間契約で</p>
            <p className="text-yellow-300 text-2xl font-bold">¥25,000/月</p>
            <p className="text-blue-200 text-xs">（年間¥60,000お得）</p>
          </div>
        </div>

        {/* 登録フォーム */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 企業名 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                企業名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例: 株式会社サンプル"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* スラッグ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                スラッグ（企業識別ID） <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="例: sample-company"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                小文字の英数字とハイフンのみ使用可能。URLに使用されます。
              </p>
            </div>

            {/* ドメイン */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                メールドメイン（任意）
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) =>
                  setFormData({ ...formData, domain: e.target.value })
                }
                placeholder="例: company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                このドメインのメールアドレスを持つユーザーを自動的に企業に紐付けます。
              </p>
            </div>

            {/* 最大ユーザー数 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                最大ユーザー数
              </label>
              <select
                value={formData.maxUsers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxUsers: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={50}>50名</option>
                <option value={100}>100名</option>
                <option value={200}>200名</option>
                <option value={500}>500名</option>
              </select>
            </div>

            {/* 契約タイプ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                契約タイプ
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, contractType: "MONTHLY" })
                  }
                  className={`p-4 border-2 rounded-lg transition ${
                    formData.contractType === "MONTHLY"
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-bold">月額契約</div>
                  <div className="text-2xl font-bold text-primary mt-1">
                    ¥30,000
                  </div>
                  <div className="text-xs text-gray-600">月額（税込）</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, contractType: "ANNUAL" })
                  }
                  className={`p-4 border-2 rounded-lg transition relative ${
                    formData.contractType === "ANNUAL"
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                    お得
                  </div>
                  <div className="font-bold">年額契約</div>
                  <div className="text-2xl font-bold text-primary mt-1">
                    ¥25,000
                  </div>
                  <div className="text-xs text-gray-600">月額換算（税込）</div>
                </button>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <span className="text-2xl">ℹ️</span>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-2">ご注意</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>企業アカウント作成後、管理者として登録されます</li>
                    <li>メンバーの招待はダッシュボードから行えます</li>
                    <li>
                      支払い設定は後ほどダッシュボードから設定できます
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={
                  !formData.name ||
                  !formData.slug ||
                  createCompanyMutation.isPending
                }
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createCompanyMutation.isPending ? "作成中..." : "企業アカウントを作成"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
