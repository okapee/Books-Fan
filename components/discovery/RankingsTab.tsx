"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { EmptyState } from "./EmptyState";
import { FollowButton } from "@/components/user/FollowButton";

export function RankingsTab() {
  const { data: session } = useSession();

  const { data: topReviewers, isLoading: reviewersLoading } =
    trpc.discovery.getTopReviewers.useQuery({ limit: 10 });

  const { data: topFollowed, isLoading: followedLoading } =
    trpc.discovery.getTopFollowed.useQuery({ limit: 10 });

  if (reviewersLoading || followedLoading) {
    return (
      <div className="space-y-8">
        {[1, 2].map((section) => (
          <div key={section} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="bg-white rounded-xl shadow-lg p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (
    (!topReviewers || topReviewers.length === 0) &&
    (!topFollowed || topFollowed.length === 0)
  ) {
    return (
      <EmptyState
        icon="📊"
        title="ランキングデータがありません"
        message="ユーザーのアクティビティがまだありません"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* 投稿数ランキング */}
      {topReviewers && topReviewers.length > 0 && (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              📝 投稿数ランキング
            </h2>
            <p className="text-gray-600">
              多くのレビューを投稿しているユーザー
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-100">
              {topReviewers.map((user, index) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-4 p-6 hover:bg-gray-50 transition group"
                >
                  {/* ランク */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {index === 0 && (
                      <span className="text-3xl">🥇</span>
                    )}
                    {index === 1 && (
                      <span className="text-3xl">🥈</span>
                    )}
                    {index === 2 && (
                      <span className="text-3xl">🥉</span>
                    )}
                    {index > 2 && (
                      <span className="text-2xl font-bold text-gray-400">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* ユーザー情報 */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* アバター */}
                    <div className="flex-shrink-0">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          {user.name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    {/* 名前とバイオ */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition truncate">
                        {user.name || "名前なし"}
                      </h3>
                      {user.bio && (
                        <p className="text-sm text-gray-600 truncate">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 統計とアクション */}
                  <div className="flex gap-4 items-center">
                    <div className="flex gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {user._count.reviews}
                        </div>
                        <div className="text-xs text-gray-600">レビュー</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-700">
                          {user._count.followers}
                        </div>
                        <div className="text-xs text-gray-600">フォロワー</div>
                      </div>
                    </div>

                    {/* フォローボタン（自分以外の場合のみ） */}
                    {session && session.user.id !== user.id && (
                      <FollowButton userId={user.id} variant="compact" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* フォロワー数ランキング */}
      {topFollowed && topFollowed.length > 0 && (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              👥 フォロワー数ランキング
            </h2>
            <p className="text-gray-600">
              多くのフォロワーを持つ人気ユーザー
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-100">
              {topFollowed.map((user, index) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-4 p-6 hover:bg-gray-50 transition group"
                >
                  {/* ランク */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {index === 0 && (
                      <span className="text-3xl">🥇</span>
                    )}
                    {index === 1 && (
                      <span className="text-3xl">🥈</span>
                    )}
                    {index === 2 && (
                      <span className="text-3xl">🥉</span>
                    )}
                    {index > 2 && (
                      <span className="text-2xl font-bold text-gray-400">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* ユーザー情報 */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* アバター */}
                    <div className="flex-shrink-0">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          {user.name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    {/* 名前とバイオ */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition truncate">
                        {user.name || "名前なし"}
                      </h3>
                      {user.bio && (
                        <p className="text-sm text-gray-600 truncate">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 統計とアクション */}
                  <div className="flex gap-4 items-center">
                    <div className="flex gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {user._count.followers}
                        </div>
                        <div className="text-xs text-gray-600">フォロワー</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-700">
                          {user._count.reviews}
                        </div>
                        <div className="text-xs text-gray-600">レビュー</div>
                      </div>
                    </div>

                    {/* フォローボタン（自分以外の場合のみ） */}
                    {session && session.user.id !== user.id && (
                      <FollowButton userId={user.id} variant="compact" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
