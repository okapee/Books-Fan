import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PopupManager } from "@/components/modals/PopupManager";
import { TrialExpiredBanner } from "@/components/banners/TrialExpiredBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Books Fan - 本好きのためのレビュー&推薦プラットフォーム",
  description:
    "本のレビューを投稿・閲覧し、AIで要点を整理・可視化。あなたにぴったりの本と出会えるプラットフォーム",
  keywords: [
    "本",
    "レビュー",
    "読書",
    "AI",
    "要約",
    "推薦",
    "ブックレビュー",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} font-sans antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          <TrialExpiredBanner />
          <main className="flex-1">{children}</main>
          <Footer />
          <PopupManager />
        </Providers>
      </body>
    </html>
  );
}
