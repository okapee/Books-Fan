export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            プライバシーポリシー
          </h1>
          <p className="text-gray-600">
            最終更新日: 2025年12月30日
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <p className="text-gray-700 leading-relaxed">
              Books Fan（以下「当サービス」といいます）は、
              ユーザーの個人情報の保護に最大限の注意を払い、
              以下の方針に基づいて個人情報を取り扱います。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. 収集する情報</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              当サービスは、以下の情報を収集します：
            </p>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">1.1 アカウント情報</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed mb-4">
              <li>Googleアカウントの名前</li>
              <li>メールアドレス</li>
              <li>プロフィール画像</li>
              <li>ユーザーが任意で設定する自己紹介文</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-800 mb-3">1.2 利用情報</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed mb-4">
              <li>投稿したレビュー内容</li>
              <li>お気に入り登録した書籍</li>
              <li>フォロー・フォロワー関係</li>
              <li>AI要約機能の利用履歴</li>
              <li>サービス利用日時</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-800 mb-3">1.3 決済情報</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                プレミアムプランの決済はStripeを通じて行われます。
                クレジットカード情報は当サービスのサーバーに保存されず、
                Stripeによって安全に管理されます。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. 情報の利用目的</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              収集した情報は、以下の目的で利用します：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>当サービスの提供・運営・改善</li>
              <li>ユーザー認証とアカウント管理</li>
              <li>パーソナライズされた推薦機能の提供</li>
              <li>AI要約機能の提供</li>
              <li>ユーザーサポートの提供</li>
              <li>利用状況の分析と統計情報の作成</li>
              <li>不正利用の防止</li>
              <li>重要なお知らせの送信</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. 情報の共有と開示</h2>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">3.1 公開情報</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              以下の情報は、他のユーザーに公開されます：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed mb-4">
              <li>プロフィール情報（名前、画像、自己紹介文）</li>
              <li>公開設定にしたレビュー</li>
              <li>フォロー・フォロワー数</li>
              <li>投稿数などの統計情報</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-800 mb-3">3.2 第三者への提供</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              当サービスは、以下の場合を除き、
              ユーザーの個人情報を第三者に提供しません：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed mb-4">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-800 mb-3">3.3 サービス提供者</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              当サービスは、以下のサービス提供者と情報を共有する場合があります：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>Google（認証サービス）</li>
              <li>Stripe（決済サービス）</li>
              <li>OpenAI（AI機能）</li>
              <li>Vercel（ホスティングサービス）</li>
              <li>Supabase（データベース）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Cookie</h2>
            <p className="text-gray-700 leading-relaxed">
              当サービスは、ユーザー体験の向上とサービスの改善のために、
              Cookieを使用します。Cookieは、ブラウザの設定で無効化できますが、
              一部の機能が正常に動作しなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. データの保存と保護</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                ユーザーデータは、業界標準のセキュリティ対策を施した
                サーバーに保存されます。
              </li>
              <li>
                通信は、SSL/TLSによって暗号化されます。
              </li>
              <li>
                データベースへのアクセスは、厳重に管理されています。
              </li>
              <li>
                ただし、インターネット上の完全なセキュリティは保証できないため、
                ユーザー自身も適切なセキュリティ対策を講じることを推奨します。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. データの保持期間</h2>
            <p className="text-gray-700 leading-relaxed">
              ユーザーのデータは、アカウントが有効である限り保持されます。
              アカウントを削除した場合、個人情報は30日以内に削除されますが、
              法令で定められた保存義務がある場合や、
              不正利用の防止のために必要な場合は、
              必要な期間保持されることがあります。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. ユーザーの権利</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              ユーザーは、以下の権利を有します：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                <strong>アクセス権</strong>: 
                自分の個人情報にアクセスし、確認する権利
              </li>
              <li>
                <strong>訂正権</strong>: 
                不正確または不完全な個人情報を訂正する権利
              </li>
              <li>
                <strong>削除権</strong>: 
                自分の個人情報の削除を要求する権利
              </li>
              <li>
                <strong>データポータビリティ権</strong>: 
                自分のデータを他のサービスに移行する権利
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              これらの権利を行使する場合は、
              お問い合わせページからご連絡ください。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. 子どものプライバシー</h2>
            <p className="text-gray-700 leading-relaxed">
              当サービスは、13歳未満の子どもを対象としていません。
              13歳未満の子どもの個人情報を意図的に収集することはありません。
              万が一、13歳未満の子どもの情報を収集したことが判明した場合、
              速やかに削除します。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">9. プライバシーポリシーの変更</h2>
            <p className="text-gray-700 leading-relaxed">
              当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。
              重要な変更がある場合は、サービス内で通知します。
              変更後も当サービスを継続して利用した場合、
              変更後のプライバシーポリシーに同意したものとみなされます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">10. お問い合わせ</h2>
            <p className="text-gray-700 leading-relaxed">
              プライバシーに関するご質問やご不明な点がございましたら、
              お問い合わせページからご連絡ください。
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>以上</p>
          </div>
        </div>
      </div>
    </div>
  );
}
