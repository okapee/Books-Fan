"use client";

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export function NotificationBell() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useContext();

  // 未読通知数を取得
  const { data: unreadCount } = trpc.notification.getUnreadCount.useQuery(
    undefined,
    {
      enabled: !!session,
      refetchInterval: 30000, // 30秒ごとに更新
    }
  );

  // 未読通知を取得
  const { data: notifications } = trpc.notification.getUnread.useQuery(
    undefined,
    {
      enabled: !!session && isOpen,
    }
  );

  // 通知を既読にする
  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getUnreadCount.invalidate();
      utils.notification.getUnread.invalidate();
    },
  });

  // 全て既読にする
  const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getUnreadCount.invalidate();
      utils.notification.getUnread.invalidate();
    },
  });

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 通知クリック時
  const handleNotificationClick = (notificationId: string, reviewId?: string | null) => {
    markAsRead.mutate({ notificationId });
    setIsOpen(false);
  };

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

  // ログインしていない場合は表示しない
  if (!session) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 通知ベルボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary transition rounded-full hover:bg-gray-100"
      >
        <svg
          className="w-6 h-6"
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

        {/* 未読数バッジ */}
        {unreadCount !== undefined && unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 通知ドロップダウン */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* ヘッダー */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">通知</h3>
            {notifications && notifications.length > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-primary hover:underline"
              >
                全て既読にする
              </button>
            )}
          </div>

          {/* 通知リスト */}
          <div className="overflow-y-auto flex-1">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationLink(notification)}
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      notification.reviewId
                    )
                  }
                  className={`block p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {/* 送信者のアバター */}
                    <div className="flex-shrink-0">
                      {notification.sender?.image ? (
                        <Image
                          src={notification.sender.image}
                          alt={notification.sender.name || "User"}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {notification.sender?.name?.[0]?.toUpperCase() ||
                              "?"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 通知内容 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(new Date(notification.createdAt))}
                      </p>
                    </div>

                    {/* 未読インジケーター */}
                    {!notification.isRead && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300 mb-4"
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
                <p className="text-gray-500">通知はありません</p>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <Link
              href="/notifications"
              className="block text-center text-sm text-primary hover:underline"
              onClick={() => setIsOpen(false)}
            >
              全ての通知を見る
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// 相対時間を取得する関数
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "たった今";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}時間前`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}日前`;
  } else {
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  }
}
