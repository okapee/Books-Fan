import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface ActivityCardProps {
  activity: {
    type: "review" | "favorite";
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    book: {
      id: string;
      googleBooksId: string | null;
      title: string;
      author: string;
      coverImageUrl: string | null;
    };
    rating?: number;
    content?: string;
    createdAt: Date;
  };
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const bookId = activity.book.googleBooksId || activity.book.id;

  return (
    <div className="border-b border-gray-100 p-6 hover:bg-gray-50 transition">
      <div className="flex gap-4">
        {/* User Avatar */}
        <Link href={`/profile/${activity.user.id}`} className="flex-shrink-0">
          {activity.user.image ? (
            <img
              src={activity.user.image}
              alt={activity.user.name || "User"}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center"
            style={{ display: activity.user.image ? "none" : "flex" }}
          >
            <span className="text-primary font-semibold text-lg">
              {activity.user.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
        </Link>

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <Link
              href={`/profile/${activity.user.id}`}
              className="font-semibold text-gray-900 hover:text-primary"
            >
              {activity.user.name}
            </Link>
            <span className="text-gray-600">
              {activity.type === "review" ? "さんがレビューしました" : "さんがお気に入りに追加しました"}
            </span>
          </div>

          {/* Book Info */}
          <Link
            href={`/books/${bookId}`}
            className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary transition"
          >
            {/* Book Cover */}
            {activity.book.coverImageUrl && (
              <img
                src={activity.book.coverImageUrl}
                alt={activity.book.title}
                className="w-16 h-24 object-cover rounded"
              />
            )}

            {/* Book Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                {activity.book.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {activity.book.author}
              </p>

              {/* Rating (for reviews) */}
              {activity.type === "review" && activity.rating !== undefined && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < activity.rating!
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}

              {/* Review Content Snippet */}
              {activity.type === "review" && activity.content && (
                <p className="text-sm text-gray-700 line-clamp-2 mt-2">
                  {activity.content}
                </p>
              )}
            </div>
          </Link>

          {/* Timestamp */}
          <p className="text-xs text-gray-500 mt-2">
            {formatDistanceToNow(new Date(activity.createdAt), {
              addSuffix: true,
              locale: ja,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
