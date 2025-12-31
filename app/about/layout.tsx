import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "Books Fanについて",
  description: "Books Fanは、本好きのためのレビュー&推薦プラットフォームです。AIを活用した要約機能で、読書体験をより豊かにします。",
  url: "/about",
  keywords: ["About", "Books Fan", "本のレビュー", "読書プラットフォーム", "AI要約"],
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
