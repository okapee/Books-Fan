"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ログイン済みの場合は本を探すページにリダイレクト
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/books");
    }
  }, [status, router]);

  // ローディング中は何も表示しない
  if (status === "loading" || status === "authenticated") {
    return null;
  }

  // 未ログインの場合はランディングページを表示
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-indigo-600">
                Books Fan
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm text-gray-700 hover:text-blue-600 transition"
              >
                特徴
              </Link>
              <Link
                href="#all-features"
                className="text-sm text-gray-700 hover:text-blue-600 transition"
              >
                充実の機能
              </Link>
              <Link
                href="#testimonials"
                className="text-sm text-gray-700 hover:text-blue-600 transition"
              >
                読者の声
              </Link>
              <Link
                href="/books"
                className="text-sm text-gray-700 hover:text-blue-600 transition"
              >
                本を探す
              </Link>
              <Link
                href="/blog"
                className="text-sm text-gray-700 hover:text-blue-600 transition"
              >
                ブログ
              </Link>
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-sm text-gray-700 hover:text-blue-600 transition"
              >
                ログイン
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                無料で始める
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="メニュー"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              <Link
                href="#features"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                機能
              </Link>
              <Link
                href="#all-features"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                充実の機能
              </Link>
              <Link
                href="#testimonials"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                読者の声
              </Link>
              <Link
                href="/books"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                📚 本を探す
              </Link>
              <Link
                href="/blog"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                📝 ブログ
              </Link>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowLoginModal(true);
                }}
                className="w-full text-left px-4 py-3 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition"
              >
                🔐 ログイン / 無料で始める
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                はじめよう
              </h2>
              <p className="text-gray-600">
                アカウントでログインまたは新規登録
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => signIn("google")}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Googleで続ける
              </button>

              <button
                onClick={() => signIn("line")}
                className="w-full bg-[#06C755] text-white px-6 py-4 rounded-xl font-medium hover:bg-[#05b34c] transition-all flex items-center justify-center gap-3"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                LINEで続ける
              </button>
            </div>

            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/30 via-purple-50/20 to-white py-16 md:py-20">
        {/* Animated background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight text-left inline-block" style={{ wordBreak: 'keep-all' }}>
              <span className="block text-gray-900 animate-fadeIn-slow mb-3">
                本への愛を
              </span>
              <span className="block md:inline bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient animate-fadeIn-slow animation-delay-1000 mb-3 xl:whitespace-nowrap">
                もっと深く、
              </span>
              <span className="block md:inline bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent animate-gradient animate-fadeIn-slow animation-delay-1500 xl:whitespace-nowrap">
                もっと広く。
              </span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto px-6">
              あなただけの読書プラットフォーム。
              <br />
              本との出会いを記録し、新しい発見をお届けします。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-blue-600 text-white px-10 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:scale-105 duration-300"
              >
                無料で始める
              </button>
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 group transition-all duration-300"
              >
                詳しく見る
                <svg
                  className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Books Carousel */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              人気の本
            </h2>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {[
                  [
                    {
                      title: "7つの習慣",
                      author: "スティーブン・R・コヴィー",
                      rating: 4.9,
                      asin: "4906638015",
                      image:
                        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
                    },
                    {
                      title: "サピエンス全史",
                      author: "ユヴァル・ノア・ハラリ",
                      rating: 4.7,
                      asin: "430922671X",
                      image:
                        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
                    },
                    {
                      title: "嫌われる勇気",
                      author: "岸見一郎・古賀史健",
                      rating: 4.6,
                      asin: "4478025819",
                      image:
                        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
                    },
                    {
                      title: "FACTFULNESS",
                      author: "ハンス・ロスリング",
                      rating: 4.8,
                      asin: "4822289605",
                      image:
                        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
                    },
                    {
                      title: "思考の整理学",
                      author: "外山滋比古",
                      rating: 4.5,
                      asin: "4480020470",
                      image:
                        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop",
                    },
                    {
                      title: "人を動かす",
                      author: "デール・カーネギー",
                      rating: 4.8,
                      asin: "442210098X",
                      image:
                        "https://images.unsplash.com/photo-1521714161819-15534968fc5f?w=400&h=600&fit=crop",
                    },
                  ],
                  [
                    {
                      title: "7つの習慣",
                      author: "スティーブン・R・コヴィー",
                      rating: 4.9,
                      asin: "4906638015",
                      image:
                        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
                    },
                    {
                      title: "サピエンス全史",
                      author: "ユヴァル・ノア・ハラリ",
                      rating: 4.7,
                      asin: "430922671X",
                      image:
                        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
                    },
                    {
                      title: "嫌われる勇気",
                      author: "岸見一郎・古賀史健",
                      rating: 4.6,
                      asin: "4478025819",
                      image:
                        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
                    },
                    {
                      title: "FACTFULNESS",
                      author: "ハンス・ロスリング",
                      rating: 4.8,
                      asin: "4822289605",
                      image:
                        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
                    },
                    {
                      title: "思考の整理学",
                      author: "外山滋比古",
                      rating: 4.5,
                      asin: "4480020470",
                      image:
                        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop",
                    },
                    {
                      title: "人を動かす",
                      author: "デール・カーネギー",
                      rating: 4.8,
                      asin: "442210098X",
                      image:
                        "https://images.unsplash.com/photo-1521714161819-15534968fc5f?w=400&h=600&fit=crop",
                    },
                  ],
                ].map((slide, slideIndex) => (
                  <div key={slideIndex} className="min-w-full">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-4">
                      {slide.map((book, index) => (
                        <a
                          key={index}
                          href={`https://www.amazon.co.jp/dp/${book.asin}?tag=okazaki060804-22`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group cursor-pointer block"
                        >
                          <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <img
                              src={book.image}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm mb-1 truncate group-hover:text-blue-600 transition-colors duration-300">
                            {book.title}
                          </h3>
                          <p className="text-xs text-gray-600 truncate mb-1">
                            {book.author}
                          </p>
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-yellow-400 fill-current animate-pulse-slow"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-700">
                              {book.rating}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev === 0 ? 1 : prev - 1))
              }
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all z-10"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev === 1 ? 0 : prev + 1))
              }
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all z-10"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {[0, 1].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index ? "bg-blue-600 w-8" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reading Journey Section */}
      <section
        id="features"
        className="relative bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 py-12 md:py-16 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              読書の旅を、完全サポート
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              本と出会い、読書を記録し、知識を整理する。
              <br />
              すべてがひとつのプラットフォームで完結します。
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "本と出会う",
                  description:
                    "読んでいる本、気になる本をリストアップ。あなただけの書棚がここにあります。",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  ),
                  bgColor: "bg-blue-600",
                },
                {
                  title: "読書を記録",
                  description:
                    "本のハイライト、メモ、感想を記録。読書の軌跡を可視化できます。",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  ),
                  bgColor: "bg-green-600",
                },
                {
                  title: "知識を検索",
                  description:
                    "あなたの読書ノート全体から必要な情報をすぐに検索。知識がつながります。",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  ),
                  bgColor: "bg-purple-600",
                },
                {
                  title: "人とつながる",
                  description:
                    "同じ本を読む仲間と出会い、感想をシェア。読書体験が深まります。",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  ),
                  bgColor: "bg-pink-600",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="text-center group animate-fadeIn"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div
                    className={`mb-6 inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} text-white rounded-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-float`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/features"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group"
              >
                すべての機能を確認する
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* All Features Section */}
      <section
        id="all-features"
        className="bg-gradient-to-br from-purple-100 via-purple-50 to-blue-50 py-12 md:py-16"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-indigo-600 mb-4">
              充実の機能
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              読書をもっと深く、もっと楽しく。
              <br />
              あなたの読書体験を豊かにする、多彩な機能をご用意しています。
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "レビューを書く",
                  description:
                    "あなたの読書体験を記録し、感想や考察を自由に書き留められます。",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  ),
                  iconBg: "bg-orange-500",
                  cardBg: "bg-orange-50",
                },
                {
                  title: "AI要約機能",
                  description:
                    "長文の本も要点をAIが自動要約。復習や振り返りが簡単になります。",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  ),
                  iconBg: "bg-purple-600",
                  cardBg: "bg-purple-50",
                },
                {
                  title: "パーソナル推薦",
                  description:
                    "あなたの読書履歴から、ぴったりの本をAIが推薦。新しい発見があります。",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ),
                  iconBg: "bg-pink-600",
                  cardBg: "bg-pink-50",
                },
                {
                  title: "マインドマップ",
                  description:
                    "読んだ本の関連性を可視化。知識のつながりが一目でわかります。",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  ),
                  iconBg: "bg-teal-600",
                  cardBg: "bg-teal-50",
                },
                {
                  title: "ポモドーロタイマー",
                  description:
                    "集中して読書するための時間管理ツール。効率的な読書習慣を作ります。",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  iconBg: "bg-amber-500",
                  cardBg: "bg-amber-50",
                },
                {
                  title: "ソーシャル機能",
                  description:
                    "友人と読書ノートを共有したり、コメントを交換。読書がもっと楽しくなります。",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  ),
                  iconBg: "bg-cyan-600",
                  cardBg: "bg-cyan-50",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`${feature.cardBg} p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fadeIn group`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`w-12 h-12 ${feature.iconBg} text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gray-100 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-indigo-600 mb-4">
              読者の声
            </h2>
            <p className="text-lg text-gray-700">
              Books Fanを利用している方々から、
              <br />
              たくさんの嬉しいお声をいただいています。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "佐藤愛美",
                role: "読書家",
                avatar:
                  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces",
                comment:
                  "以前は読んだ本の内容を忘れてしまうことが多かったのですが、Books Fanで記録を始めてから、本から得た知識が確実に自分のものになっていると実感しています。検索機能も優秀で、必要な情報がすぐに見つかります。",
              },
              {
                name: "田中健太",
                role: "ビジネスパーソン",
                comment:
                  "忙しい毎日の中で、効率的に読書をしたいと思っていました。ポモドーロタイマーとAI要約機能のおかげで、限られた時間でも質の高い読書体験ができています。マインドマップ機能も素晴らしいです！",
                avatar:
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
              },
              {
                name: "山田花子",
                role: "大学生",
                avatar:
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
                comment:
                  "同じ本を読んでいる友達とつながれるのが嬉しいです。感想を共有したり、おすすめの本を教え合ったり、読書がより楽しくなりました。パーソナル推薦機能で、自分では選ばなかったジャンルの本にも出会えます。",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative group animate-fadeIn"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <svg
                    className="w-16 h-16 text-gray-900"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Star Rating */}
                <div className="flex gap-1 mb-4 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-300"
                      style={{ transitionDelay: `${i * 0.05}s` }}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed mb-6 relative z-10">
                  {testimonial.comment}
                </p>

                <div className="flex items-center gap-4 relative z-10">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-4 group-hover:ring-indigo-200 transition-all duration-300"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 py-16 md:py-20 overflow-hidden animate-gradient">
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float animation-delay-2000"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fadeIn">
            今すぐ始めよう
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto animate-fadeIn animation-delay-200">
            無料でアカウントを作成して、あなたの読書体験を
            <br />
            次のレベルへ引き上げましょう。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 animate-fadeIn animation-delay-400">
            <button
              onClick={() => signIn("google")}
              className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105 duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Googleで始める
            </button>
            <button
              onClick={() => signIn("line")}
              className="bg-[#06C755] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#05b34c] transition-all shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105 duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              LINEで始める
            </button>
          </div>
          <p className="text-sm text-white/80">
            クレジットカード不要 • 無料プランでずっと利用可能
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-3">Books Fan</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                あなたの読書体験を、
                <br />
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
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold mb-4">機能</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>
                  <Link
                    href="/reading"
                    className="hover:text-white transition-colors"
                  >
                    読書管理
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reviews"
                    className="hover:text-white transition-colors"
                  >
                    レビュー機能
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="hover:text-white transition-colors"
                  >
                    AI要約
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="hover:text-white transition-colors"
                  >
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
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    運営会社
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    採用情報
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
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
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal"
                    className="hover:text-white transition-colors"
                  >
                    特定商取引法
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    ヘルプセンター
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-white transition-colors"
                  >
                    よくある質問
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2026 Books Fan. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
