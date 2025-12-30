"use client";

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const utils = trpc.useContext();

  // 全ての通知を取得
  const { data: allNotifications, isLoading } =
    trpc.notification.getAll.useQuery(undefined, {
      enabled: !!session,
    });

  // 通知を既読にする
  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getAll.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  // 全て既読にする
  const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getAll.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  // 通知を削除
  const deleteNotification = trpc.notification.delete.useMutation({
    onSuccess: () => {
      utils.notification.getAll.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  // フィルタリングされた通知
  const notifications =
    filter === "unread"
      ? allNotifications?.filter((n) => !n.isRead)
      : allNotifications;

  // 通知のリンク先を取得
  const getNotificationLink = (notification: any) => {
    if (notification.reviewId && notification.bookGoogleId) {
      return `/books/${notification.bookGoogleId}/review/${notification.reviewId}`;
    }
    if (notification.type === "FOLLOW") {
      return `/profile`;
    }
    return "#";
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">ログインが必要です</p>
            <Link href="/" className="text-primary hover:underline">
              トップページへ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg">
          {/* ヘッダー */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-primary">通知</h1>
              {notifications && notifications.length > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  全て既読にする
                </button>
              )}
            </div>

            {/* フィルター */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "all"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                全て
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "unread"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                未読
              </button>
            </div>
          </div>

          {/* 通知リスト */}
          <div>
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 border-b border-gray-100 hover:bg-gray-50 transition ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    {/* 送信者のアバター */}
                    <div className="flex-shrink-0">
                      {notification.sender?.image ? (
                        <img
                          src={notification.sender.image}
                          alt={notification.sender.name || "User"}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold text-lg">
                            {notification.sender?.name?.[0]?.toUpperCase() ||
                              "?"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 通知内容 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString(
                          "ja-JP",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>

                      {/* アクション */}
                      <div className="flex gap-4 mt-3">
                        <Link
                          href={getNotificationLink(notification)}
                          onClick={() =>
                            !notification.isRead &&
                            markAsRead.mutate({
                              notificationId: notification.id,
                            })
                          }
                          className="text-sm text-primary hover:underline"
                        >
                          詳細を見る
                        </Link>
                        {!notification.isRead && (
                          <button
                            onClick={() =>
                              markAsRead.mutate({
                                notificationId: notification.id,
                              })
                            }
                            className="text-sm text-gray-600 hover:underline"
                          >
                            既読にする
                          </button>
                        )}
                        <button
                          onClick={() =>
                            deleteNotification.mutate({
                              notificationId: notification.id,
                            })
                          }
                          className="text-sm text-red-600 hover:underline"
                        >
                          削除
                        </button>
                      </div>
                    </div>

                    {/* 未読インジケーター */}
                    {!notification.isRead && (
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <svg
                  className="w-20 h-20 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-gray-500 text-lg">
                  {filter === "unread"
                    ? "未読の通知はありません"
                    : "通知はありません"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
