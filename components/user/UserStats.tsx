"use client";

import { trpc } from "@/lib/trpc";

interface UserStatsProps {
  userId: string;
  className?: string;
}

export function UserStats({ userId, className = "" }: UserStatsProps) {
  const { data: followerCount } = trpc.follow.getFollowerCount.useQuery({
    userId,
  });

  const { data: followingCount } = trpc.follow.getFollowingCount.useQuery({
    userId,
  });

  return (
    <div className={`flex gap-6 ${className}`}>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">
          {followerCount ?? 0}
        </div>
        <div className="text-sm text-gray-600">フォロワー</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">
          {followingCount ?? 0}
        </div>
        <div className="text-sm text-gray-600">フォロー中</div>
      </div>
    </div>
  );
}
