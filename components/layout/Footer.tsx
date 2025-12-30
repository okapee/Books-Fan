import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-4">Books Fan</h3>
            <p className="text-sm opacity-90">
              本好きのためのレビュー&推薦プラットフォーム
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">機能</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <Link href="/books" className="hover:opacity-100 transition">
                  本を探す
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:opacity-100 transition">
                  レビュー
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:opacity-100 transition">
                  料金プラン
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">サポート</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <Link href="/about" className="hover:opacity-100 transition">
                  Books Fanについて
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:opacity-100 transition">
                  ヘルプ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:opacity-100 transition">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">法的情報</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <Link href="/terms" className="hover:opacity-100 transition">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:opacity-100 transition">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Sharing */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col items-center gap-4">
            <h4 className="font-semibold text-sm">Books Fanをシェア</h4>
            <div className="flex gap-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  "Books Fan - 本好きのためのレビュー&推薦プラットフォーム 📚"
                )}&url=${encodeURIComponent("https://books-fan.com")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white p-3 rounded-full transition shadow-lg"
                aria-label="Xでシェア"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  "https://books-fan.com"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877F2] hover:bg-[#166fe5] text-white p-3 rounded-full transition shadow-lg"
                aria-label="Facebookでシェア"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
                  "https://books-fan.com"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#00B900] hover:bg-[#00a000] text-white p-3 rounded-full transition shadow-lg"
                aria-label="LINEでシェア"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm opacity-75">
          <p>&copy; 2025 Books Fan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
