"use client";

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "compact" | "icon";
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  userId,
  variant = "default",
  className = "",
  onFollowChange,
}: FollowButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // フォロー状態を取得
  const { data: followStatus, refetch } = trpc.follow.isFollowing.useQuery(
    { followingId: userId },
    { enabled: !!session && !!userId }
  );

  // フォローmutation
  const followMutation = trpc.follow.follow.useMutation({
    onSuccess: () => {
      refetch();
      onFollowChange?.(true);
    },
  });

  // フォロー解除mutation
  const unfollowMutation = trpc.follow.unfollow.useMutation({
    onSuccess: () => {
      refetch();
      onFollowChange?.(false);
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/");
      return;
    }

    if (followStatus?.isFollowing) {
      unfollowMutation.mutate({ followingId: userId });
    } else {
      followMutation.mutate({ followingId: userId });
    }
  };

  const isLoading = followMutation.isPending || unfollowMutation.isPending;
  const isFollowing = followStatus?.isFollowing || false;

  // アイコンのみバリアント
  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition disabled:opacity-50 ${
          isFollowing
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
            : "bg-blue-600 text-white hover:bg-blue-700"
        } ${className}`}
        title={isFollowing ? "フォロー中" : "フォローする"}
      >
        {isFollowing ? (
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        )}
      </button>
    );
  }

  // コンパクトバリアント
  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition disabled:opacity-50 whitespace-nowrap ${
          isFollowing
            ? "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
            : "bg-blue-600 text-white hover:bg-blue-700"
        } ${className}`}
      >
        {isLoading ? "..." : isFollowing ? "フォロー中" : "フォロー"}
      </button>
    );
  }

  // デフォルトバリアント
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold transition disabled:opacity-50 ${
        isFollowing
          ? "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
          : "bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700"
      } ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          処理中
        </span>
      ) : isFollowing ? (
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          フォロー中
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
          </svg>
          フォローする
        </span>
      )}
    </button>
  );
}
