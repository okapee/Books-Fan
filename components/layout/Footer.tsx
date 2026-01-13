"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 md:py-14">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-3">Books Fan</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              あなたの読書体験を、<br />
              もっと豊かに。
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const url = 'https://books-fan.com';
                  const text = 'Books Fan - あなたの読書体験をもっと豊かに';
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
                }}
                className="w-10 h-10 bg-gray-800 hover:bg-black rounded-full flex items-center justify-center transition-colors"
                aria-label="Xでシェア"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button
                onClick={() => {
                  const url = 'https://books-fan.com';
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
                }}
                className="w-10 h-10 bg-gray-800 hover:bg-[#1877F2] rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebookでシェア"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button
                onClick={() => {
                  const url = 'https://books-fan.com';
                  window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
                }}
                className="w-10 h-10 bg-gray-800 hover:bg-[#06C755] rounded-full flex items-center justify-center transition-colors"
                aria-label="LINEでシェア"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4">機能</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/reading" className="hover:text-white transition-colors">
                  読書管理
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-white transition-colors">
                  レビュー機能
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  AI要約
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  マインドマップ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">会社情報</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  運営会社
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">
                  採用情報
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">サポート</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-white transition-colors">
                  特定商取引法
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  よくある質問
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 md:pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2026 Books Fan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
