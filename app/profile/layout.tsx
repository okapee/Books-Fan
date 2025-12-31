import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "プロフィール",
  description: "あなたの読書記録、レビュー、お気に入りの本を管理できます。読書傾向の分析やマインドマップ機能も利用可能です。",
  url: "/profile",
  keywords: ["プロフィール", "読書記録", "レビュー管理", "お気に入り", "読書統計"],
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
