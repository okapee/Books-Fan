import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Books Fanについて
          </h1>
          <p className="text-xl text-gray-600">
            本好きのためのレビュー&推薦プラットフォーム
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          {/* Mission */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">📚</span>
              私たちのミッション
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Books Fanは、読書をもっと楽しく、もっと深くするためのプラットフォームです。
              本を読んだ感動や発見を記録し、共有し、新しい本との出会いをサポートします。
              AIの力を活用して、あなたの読書体験を整理し、次に読むべき一冊を見つけるお手伝いをします。
            </p>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">✨</span>
              主な機能
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-bold text-gray-800 mb-2">レビューの記録</h3>
                <p className="text-gray-700">
                  読んだ本の感想を星評価とテキストで記録できます。読書の記録を一箇所に集約し、後から見返すことができます。
                </p>
              </div>
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-bold text-gray-800 mb-2">AI要約機能（プレミアム）</h3>
                <p className="text-gray-700">
                  AIがあなたのレビューや本の内容を分析し、主要なポイントを箇条書きで整理します。
                  読書メモの作成時間を短縮し、効率的に知識を整理できます。
                </p>
              </div>
              <div className="border-l-4 border-pink-600 pl-4">
                <h3 className="font-bold text-gray-800 mb-2">パーソナル推薦</h3>
                <p className="text-gray-700">
                  あなたの読書傾向を分析し、興味に合った本を推薦します。
                  同じ趣味を持つユーザーのレビューも参考にできます。
                </p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-bold text-gray-800 mb-2">コミュニティ機能</h3>
                <p className="text-gray-700">
                  他のユーザーをフォローしたり、レビューを共有したりできます。
                  読書好きのコミュニティで新しい発見を楽しめます。
                </p>
              </div>
            </div>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">💡</span>
              大切にしていること
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">シンプル</h3>
                <p className="text-sm text-gray-600">
                  使いやすさを第一に、直感的なインターフェースを提供します
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">プライバシー</h3>
                <p className="text-sm text-gray-600">
                  あなたのデータを大切に扱い、セキュリティを最優先します
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌟</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">成長</h3>
                <p className="text-sm text-gray-600">
                  ユーザーの声を聞き、常にサービスを改善し続けます
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              さあ、始めましょう
            </h2>
            <p className="text-gray-700 mb-6">
              Books Fanで、あなたの読書ライフをもっと豊かに
            </p>
            <Link
              href="/books"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              本を探す
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
