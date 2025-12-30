"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ContactPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 実際の送信処理を実装
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              送信完了
            </h1>
            <p className="text-gray-700 mb-8">
              お問い合わせありがとうございます。
              <br />
              内容を確認の上、2〜3営業日以内にご返信いたします。
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              トップページへ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            お問い合わせ
          </h1>
          <p className="text-xl text-gray-600">
            ご質問やご要望をお聞かせください
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-gray-800 mb-4">よくある質問</h2>
              <p className="text-sm text-gray-700 mb-4">
                お問い合わせの前に、ヘルプセンターで解決できる場合があります
              </p>
              <Link
                href="/help"
                className="inline-block text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                ヘルプセンターへ →
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-gray-800 mb-4">対応時間</h2>
              <p className="text-sm text-gray-700">
                平日 10:00〜18:00
                <br />
                （土日祝日を除く）
                <br />
                <br />
                ※返信まで2〜3営業日いただく場合があります
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="山田太郎"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  お問い合わせ種別 <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="general">一般的な質問</option>
                  <option value="technical">技術的な問題</option>
                  <option value="billing">料金・請求について</option>
                  <option value="feature">機能の要望</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                  placeholder="できるだけ詳しくお書きください"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
              >
                送信する
              </button>

              <p className="text-xs text-gray-600 text-center">
                送信いただいた情報は、お問い合わせ対応のみに使用し、
                <br />
                第三者に提供することはありません
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
