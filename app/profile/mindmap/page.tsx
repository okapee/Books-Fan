import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MindMapClient } from "./MindMapClient";

export const metadata = {
  title: "読書マインドマップ | Books Fan",
  description: "あなたの読書記録をマインドマップで視覚化",
};

export default async function MindMapPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  // ユーザーのレビューを取得
  const reviews = await prisma.review.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      rating: true,
      content: true,
      createdAt: true,
      book: {
        select: {
          title: true,
          author: true,
          categories: true,
        },
      },
      aiSummary: {
        select: {
          keyPoints: true,
          summaryText: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            📚 読書マインドマップ
          </h1>
          <p className="text-gray-600">
            あなたの読書記録を視覚的に整理します
          </p>
        </div>

        {/* Mind Map Client Component */}
        <MindMapClient
          reviews={reviews}
          userName={session.user.name || "ユーザー"}
        />
      </div>
    </div>
  );
}
