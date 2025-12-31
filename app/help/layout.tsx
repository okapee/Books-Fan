import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "ヘルプ・よくある質問",
  description: "Books Fanの使い方や、よくある質問への回答をご覧いただけます。レビューの書き方、AI要約機能、プレミアム会員について詳しく説明します。",
  url: "/help",
  keywords: ["ヘルプ", "よくある質問", "FAQ", "使い方", "サポート"],
});

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
