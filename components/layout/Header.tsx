"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ensureHttps } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();
  const userImageUrl = ensureHttps(session?.user?.image);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-lg sm:text-2xl font-bold text-indigo-600">
              Books Fan
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
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
            {session && (
              <>
                <Link
                  href="/reading"
                  className="text-sm text-gray-700 hover:text-blue-600 transition"
                >
                  読書管理
                </Link>
                <Link
                  href="/profile"
                  className="text-sm text-gray-700 hover:text-blue-600 transition"
                >
                  マイページ
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-700 hover:text-blue-600 transition"
                >
                  ダッシュボード
                </Link>
                {(session.user as any).role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-sm text-purple-600 hover:text-purple-700 font-semibold transition"
                  >
                    管理者
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {session ? (
              <>
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  aria-label="メニュー"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {mobileMenuOpen ? (
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

                {/* User Menu */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Membership Badge */}
                  {session.user.membershipType === "PREMIUM" && (
                    <span className="hidden sm:inline-block bg-accent text-primary text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                      PREMIUM
                    </span>
                  )}
                  {session.user.membershipType === "CORPORATE" && (
                    <span className="hidden sm:inline-block bg-blue-500 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                      CORPORATE
                    </span>
                  )}

                  {/* Notification Bell */}
                  <NotificationBell />

                  {/* User Profile */}
                  <Link
                    href="/profile"
                    className="flex items-center space-x-1 sm:space-x-2 hover:opacity-80 transition"
                  >
                    {userImageUrl ? (
                      <Image
                        src={userImageUrl}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full w-7 h-7 sm:w-8 sm:h-8"
                        unoptimized
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs sm:text-sm">
                        {session.user.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden md:block">
                      {session.user.name}
                    </span>
                  </Link>

                  {/* Sign Out Button */}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition hidden sm:block"
                  >
                    ログアウト
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && session && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            <Link
              href="/books"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              📚 本を探す
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              📝 ブログ
            </Link>
            <Link
              href="/reading"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              📖 読書管理
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              👤 マイページ
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              📊 ダッシュボード
            </Link>
            {session.user.membershipType === "CORPORATE" && (
              <Link
                href="/company/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                🏢 企業ダッシュボード
              </Link>
            )}
            {(session.user as any).role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-purple-600 font-semibold hover:bg-purple-50 rounded-lg transition"
              >
                ⚙️ 管理者ダッシュボード
              </Link>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              🚪 ログアウト
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
