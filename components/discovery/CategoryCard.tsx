import Link from "next/link";

interface CategoryCardProps {
  category: string;
  bookCount: number;
}

export function CategoryCard({ category, bookCount }: CategoryCardProps) {
  // カテゴリ名をURLエンコード
  const categorySlug = encodeURIComponent(category);

  return (
    <Link
      href={`/books/category/${categorySlug}`}
      className="block p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary hover:shadow-lg transition group"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition">
          {category}
        </h3>
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-primary transition"
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
      </div>
      <p className="text-sm text-gray-600">
        {bookCount}冊の本
      </p>
    </Link>
  );
}
