"use client";

import { useState } from "react";
import Link from "next/link";

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      category: "基本的な使い方",
      questions: [
        {
          q: "Books Fanとは何ですか？",
          a: "Books Fanは、本好きのためのレビュー&推薦プラットフォームです。読んだ本の感想を記録し、AIによる要約機能でより深く理解を深めることができます。",
        },
        {
          q: "無料で使えますか？",
          a: "はい、基本機能は無料でご利用いただけます。レビューの投稿、本の検索、他のユーザーのレビュー閲覧などが可能です。AI要約機能などの高度な機能はプレミアムプラン（月額980ta）でご利用いただけます。",
        },
        {
          q: "アカウント登録は必須ですか？",
          a: "レビューの閲覧は登録なしでも可能ですが、レビューの投稿やお気に入り登録、フォロー機能などを利用するにはGoogleアカウントでのログインが必要です。",
        },
      ],
    },
    {
      category: "レビュー機能",
      questions: [
        {
          q: "レビューを書くには？",
          a: "本の詳細ページから「レビューを書く」ボタンをクリックし、星評価（1〜5つ星）と感想を入力して投稿してください。",
        },
        {
          q: "レビューは公開されますか？",
          a: "レビュー投稿時に「公開/非公開」を選択できます。公開レビューは他のユーザーも閲覧できますが、非公開レビューはあなただけが見ることができます。",
        },
        {
          q: "レビューを編集・削除できますか？",
          a: "はい、いつでも自分のレビューを編集・削除できます。レビュー詳細ページから編集・削除ボタンをご利用ください。",
        },
      ],
    },
    {
      category: "AI要約機能",
      questions: [
        {
          q: "AI要約機能とは？",
          a: "プレミアム会員限定の機能で、本の内容をAIが分析し、主要なポイントを箇条書きで整理します。月30回まで利用可能です。",
        },
        {
          q: "AI要約の精度は？",
          a: "最新のAI技術を使用していますが、100%完璧ではありません。あくまで参考情報としてご利用ください。",
        },
        {
          q: "使用回数の制限は？",
          a: "プレミアム会員は月30回まで利用できます。毎月1日にリセットされます。",
        },
      ],
    },
    {
      category: "プレミアムプラン",
      questions: [
        {
          q: "プレミアムプランの料金は？",
          a: "月額980円（税込）です。2週間の無料トライアル期間があります。",
        },
        {
          q: "無料トライアルとは？",
          a: "初めてプレミアムプランに登録する方は、2週間無料でお試しいただけます。トライアル期間中はいつでもキャンセル可能で、料金は発生しません。",
        },
        {
          q: "解約方法は？",
          a: "マイページの「プラン管理」からいつでも解約できます。解約後も現在の期間が終了するまでプレミアム機能をご利用いただけます。",
        },
      ],
    },
    {
      category: "その他",
      questions: [
        {
          q: "フォロー機能とは？",
          a: "興味のあるユーザーをフォローすることで、そのユーザーの新しいレビューを見逃さずチェックできます。",
        },
        {
          q: "プライバシーは守られますか？",
          a: "はい、個人情報は厳重に管理され、第三者に提供されることはありません。詳しくはプライバシーポリシーをご確認ください。",
        },
        {
          q: "問い合わせ方法は？",
          a: "お問い合わせページからご連絡ください。できる限り早く対応いたします。",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            ヘルプセンター
          </h1>
          <p className="text-xl text-gray-600">
            よくある質問と回答
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="font-bold text-gray-800 mb-4">クイックリンク</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/books"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition"
            >
              <span className="text-2xl">📚</span>
              <span className="font-semibold text-gray-800">本を探す</span>
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition"
            >
              <span className="text-2xl">💎</span>
              <span className="font-semibold text-gray-800">料金プラン</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-3 p-4 rounded-xl bg-pink-50 hover:bg-pink-100 transition"
            >
              <span className="text-2xl">💬</span>
              <span className="font-semibold text-gray-800">お問い合わせ</span>
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.questions.map((faq, faqIndex) => {
                  const index = categoryIndex * 100 + faqIndex;
                  const isOpen = openFaq === index;
                  return (
                    <div key={faqIndex} className="border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full text-left flex items-start justify-between gap-4 py-2"
                      >
                        <span className="font-semibold text-gray-800">{faq.q}</span>
                        <span className="text-blue-600 text-xl flex-shrink-0">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="mt-2 text-gray-700 leading-relaxed pl-4 border-l-2 border-blue-600">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            解決しない場合は
          </h2>
          <p className="text-gray-700 mb-6">
            お困りのことがありましたら、お気軽にお問い合わせください
          </p>
          <Link
            href="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            お問い合わせ
          </Link>
        </div>
      </div>
    </div>
  );
}
