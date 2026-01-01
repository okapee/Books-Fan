"use client";

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

interface PomodoroTimerProps {
  bookId: string;
  bookTitle: string;
  onComplete?: () => void;
}

export function PomodoroTimer({
  bookId,
  bookTitle,
  onComplete,
}: PomodoroTimerProps) {
  const [phase, setPhase] = useState<"work" | "break">("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分（秒単位）
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = trpc.reading.startSession.useMutation({
    onSuccess: (data) => {
      setSessionId(data.id);
    },
  });

  const completeSession = trpc.reading.completeSession.useMutation({
    onSuccess: () => {
      onComplete?.();
    },
  });

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // タイマーロジック
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handlePhaseComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handlePhaseComplete = () => {
    setIsRunning(false);

    if (phase === "work") {
      // 作業フェーズ完了 - セッション保存
      if (sessionId) {
        completeSession.mutate({ sessionId });
      }

      // 休憩フェーズへ
      setPhase("break");
      setTimeLeft(5 * 60); // 5分休憩
    } else {
      // 休憩完了 - 次の作業セッション準備
      setPhase("work");
      setTimeLeft(25 * 60);
      setSessionId(null);
    }
  };

  const handleStart = () => {
    if (phase === "work" && !sessionId) {
      // 新規セッション開始
      startSession.mutate({ bookId });
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase("work");
    setTimeLeft(25 * 60);
    setSessionId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress =
    phase === "work"
      ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
      : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 sm:p-8 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {phase === "work" ? "📖 読書タイム" : "☕ 休憩タイム"}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
          {bookTitle}
        </p>
      </div>

      {/* タイマー表示 */}
      <div className="relative mb-8 flex justify-center">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke={phase === "work" ? "#3b82f6" : "#10b981"}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl sm:text-5xl font-bold text-gray-900">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* コントロール */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={startSession.isPending}
            className="bg-primary text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 text-sm sm:text-base"
          >
            {phase === "work" && sessionId ? "再開" : "開始"}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="bg-yellow-500 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition text-sm sm:text-base"
          >
            一時停止
          </button>
        )}

        <button
          onClick={handleReset}
          className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition text-sm sm:text-base"
        >
          リセット
        </button>
      </div>

      {/* ヒント */}
      <div className="mt-6 text-center text-xs sm:text-sm text-gray-600">
        {phase === "work" ? (
          <p>💡 25分間集中して読書しましょう</p>
        ) : (
          <p>💡 5分間休憩してリフレッシュしましょう</p>
        )}
      </div>

      {/* 警告 */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
        ⚠️
        ブラウザを閉じるとセッションは保存されません。タイマーが完了するまでお待ちください。
      </div>
    </div>
  );
}
