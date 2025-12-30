export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            利用規約
          </h1>
          <p className="text-gray-600">
            最終更新日: 2025年12月30日
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">第1条（適用）</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                本規約は、Books Fan（以下「当サービス」といいます）の利用に関する条件を、
                当サービスを利用するすべてのユーザー（以下「ユーザー」といいます）と
                当サービス運営者（以下「当方」といいます）との間で定めるものです。
              </li>
              <li>
                ユーザーは、当サービスを利用することにより、本規約に同意したものとみなされます。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">第2条（アカウント登録）</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                ユーザーは、Googleアカウントを使用して当サービスにログインすることができます。
              </li>
              <li>
                ユーザーは、登録情報に虚偽の内容を含めてはならず、
                常に最新かつ正確な情報を維持する責任を負います。
              </li>
              <li>
                当方は、ユーザーが本規約に違反した場合、
                事前の通知なくアカウントを停止または削除することができます。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">第3条（サービス内容）</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              当サービスは、以下の機能を提供します：
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>書籍のレビュー投稿・閲覧機能</li>
              <li>書籍の検索・推薦機能</li>
              <li>お気に入り登録機能</li>
              <li>ユーザー間のフォロー機能</li>
              <li>AI要約機能（プレミアムプラン限定）</li>
              <li>その他、当方が随時提供する機能</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">第4条（コンテンツの投稿）</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                ユーザーは、レビューやコメントなどのコンテンツ（以下「投稿コンテンツ」といいます）を
                当サービスに投稿することができます。
              </li>
              <li>
                ユーザーは、投稿コンテンツについて自らが投稿する正当な権利を有していることを保証します。
              </li>
              <li>
                投稿コンテンツに関する著作権その他の知的財産権は、
                ユーザーまたは正当な権利者に帰属します。
              </li>
              <li>
                ユーザーは、当方に対し、投稿コンテンツを当サービスの運営、
                プロモーション、改善等の目的で使用することを許諾するものとします。
              </li>
              <li>
                ユーザーは、以下のコンテンツを投稿してはなりません：
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>法令に違反する内容</li>
                  <li>第三者の権利を侵害する内容</li>
                  <li>公序良俗に反する内容</li>
                  <li>虚偽または誤解を招く内容</li>
                  <li>スパムや宣伝を目的とする内容</li>
                  <li>その他、当方が不適切と判断する内容</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">第5条（プレミアムプラン）</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                プレミアムプランは、月額980円（税込）で利用できる有料プランです。
              </li>
              <li>
                初回登録時は2週間の無料トライアル期間があり、
                トライアル期間中はいつでもキャンセル可能です。
              </li>
              <li>
                料金は、Stripeを通じてクレジットカードで毎月自動的に請求されます。
              </li>
              <li>
                ユーザーは、いつでもプレミアムプランを解約できます。
                解約後も現在の請求期間が終了するまでプレミアム機能を利用できます。
              </li>
              <li>
                料金の返金は、法律で定められた場合を除き、原則として行いません。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">第6条（AI機能の利用）</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                AI要約機能は、プレミアムプラン会員のみが利用できます。
              </li>
              <li>
                AI要約機能の利用回数は、月30回までとします。
              </li>
              <li>
                AI要約の精度は保証されません。ユーザーは、
                AI要約の結果を参考情報として利用するものとします。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">第7条（禁止事項）</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              ユーザーは、当サービスの利用にあたり、以下の行為を行ってはなりません：
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>法令または本規約に違反する行為</li>
              <li>第三者の権利を侵害する行為</li>
              <li>当サービスの運営を妨害する行為</li>
              <li>不正アクセスやハッキング行為</li>
              <li>スパムやマルウェアの送信</li>
              <li>複数アカウントの作成による不正利用</li>
              <li>その他、当方が不適切と判断する行為</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">第8条（免責事項）</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                当方は、当サービスの内容変更、中断、終了によって生じた損害について、
                一切の責任を負いません。
              </li>
              <li>
                当方は、ユーザーが投稿したコンテンツの正確性、信頼性、
                適法性について一切の責任を負いません。
              </li>
              <li>
                当方は、当サービスが中断なく、エラーなく利用できることを保証しません。
              </li>
              <li>
                ユーザー間のトラブルについて、当方は一切の責任を負いません。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">第9条（サービスの変更・終了）</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                当方は、ユーザーへの事前通知なく、
                当サービスの内容を変更または終了することができます。
              </li>
              <li>
                当方は、当サービスの変更または終了によって生じた損害について、
                一切の責任を負いません。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">第10条（規約の変更）</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                当方は、必要に応じて本規約を変更することができます。
              </li>
              <li>
                規約変更後、ユーザーが当サービスを継続して利用した場合、
                変更後の規約に同意したものとみなされます。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">第11条（準拠法・管轄裁判所）</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                本規約の解釈にあたっては、日本法を準拠法とします。
              </li>
              <li>
                当サービスに関して紛争が生じた場合には、
                東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </li>
            </ol>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>以上</p>
          </div>
        </div>
      </div>
    </div>
  );
}
