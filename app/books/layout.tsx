import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "本を探す",
  description: "AI要約機能付きの本のレビューを検索・閲覧できます。カテゴリ別、ランキング、レビュー数など様々な条件で本を見つけられます。",
  url: "/books",
  keywords: ["本を探す", "書籍検索", "レビュー検索", "カテゴリ別", "ランキング", "おすすめ本"],
});

export default function BooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
