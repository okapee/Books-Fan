"use client";

import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface SessionHistoryProps {
  bookId: string;
}

export function SessionHistory({ bookId }: SessionHistoryProps) {
  const { data, isLoading } = trpc.reading.getSessions.useQuery({
    bookId,
    limit: 20,
  });

  if (isLoading) {
    return <div className="animate-pulse">読込中...</div>;
  }

  if (!data || data.sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        まだ読書セッションがありません
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}分`;
  };

  const totalHours = Math.floor(data.totalDuration / 3600);
  const totalMins = Math.floor((data.totalDuration % 3600) / 60);

  return (
    <div>
      {/* サマリー */}
      <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-6">
        <h3 className="font-bold text-base sm:text-lg mb-4">
          読書記録サマリー
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              {data.sessionCount}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              セッション
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              {totalHours > 0 ? `${totalHours}h` : ""}
              {totalMins}m
            </div>
            <div className="text-xs sm:text-sm text-gray-600">合計時間</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              {Math.floor(data.totalDuration / 1500)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              ポモドーロ
            </div>
          </div>
        </div>
      </div>

      {/* セッション一覧 */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
          読書履歴
        </h4>
        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {data.sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-2xl">✓</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">
                    {formatDuration(session.duration)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {formatDistanceToNow(new Date(session.createdAt), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </div>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                {new Date(session.createdAt).toLocaleDateString("ja-JP")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
