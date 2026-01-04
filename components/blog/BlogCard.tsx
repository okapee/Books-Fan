import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string | null;
  category: string;
  publishedAt: Date | null;
  author: {
    name: string | null;
    image: string | null;
  };
  viewCount: number;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  coverImage,
  category,
  publishedAt,
  author,
  viewCount,
}: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`}>
      <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group">
        {/* カバー画像 */}
        {coverImage && (
          <div className="aspect-video overflow-hidden bg-gray-200">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
        )}

        <div className="p-4 sm:p-6">
          {/* カテゴリとメタ情報 */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
              {category}
            </span>
            {publishedAt && (
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(publishedAt), {
                  addSuffix: true,
                  locale: ja,
                })}
              </span>
            )}
          </div>

          {/* タイトル */}
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-purple-600 transition">
            {title}
          </h2>

          {/* 抜粋 */}
          <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">
            {excerpt}
          </p>

          {/* フッター */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {author.image && (
                <img
                  src={author.image}
                  alt={author.name || "著者"}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                />
              )}
              <span className="text-xs sm:text-sm text-gray-700 font-medium">
                {author.name || "匿名"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className="text-xs sm:text-sm">{viewCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
