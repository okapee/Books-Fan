"use client";

import { trpc } from "@/lib/trpc";
import { CategoryCard } from "./CategoryCard";
import { EmptyState } from "./EmptyState";

export function CategoriesTab() {
  const { data: categories, isLoading } = trpc.discovery.getCategories.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="カテゴリが見つかりません"
        message="まだカテゴリ情報がありません"
      />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          カテゴリから探す
        </h2>
        <p className="text-gray-600">
          興味のあるカテゴリを選んで、本を探しましょう
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat: any) => (
          <CategoryCard
            key={cat.category}
            category={cat.category}
            bookCount={cat.bookCount}
          />
        ))}
      </div>
    </div>
  );
}
