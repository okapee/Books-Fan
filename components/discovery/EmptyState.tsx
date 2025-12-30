import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">{message}</p>
      {actionLabel && (actionHref || onAction) && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
