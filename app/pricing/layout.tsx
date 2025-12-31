import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "料金プラン",
  description: "Books Fanの料金プランをご紹介。無料プランとプレミアムプラン（月額980円）をご用意しています。AI要約機能やマインドマップ機能を利用できます。",
  url: "/pricing",
  keywords: ["料金", "プラン", "プレミアム", "無料", "AI要約", "サブスクリプション"],
});

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
