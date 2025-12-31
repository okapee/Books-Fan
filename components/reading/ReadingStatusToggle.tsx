"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface ReadingStatusToggleProps {
  bookId: string;
  onStatusChange?: (status: string | null) => void;
}

export function ReadingStatusToggle({
  bookId,
  onStatusChange,
}: ReadingStatusToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: statusData, refetch } = trpc.reading.getStatus.useQuery({
    bookId,
  });

  const setStatus = trpc.reading.setStatus.useMutation({
    onSuccess: () => {
      refetch();
      setIsOpen(false);
      onStatusChange?.(statusData?.status || null);
    },
  });

  const removeStatus = trpc.reading.removeStatus.useMutation({
    onSuccess: () => {
      refetch();
      setIsOpen(false);
      onStatusChange?.(null);
    },
  });

  const currentStatus = statusData?.status;

  const statusOptions = [
    { value: "WANT_TO_READ", label: "読みたい", icon: "📚", color: "blue" },
    { value: "READING", label: "読書中", icon: "📖", color: "green" },
    { value: "COMPLETED", label: "読了", icon: "✅", color: "purple" },
  ];

  const currentOption = statusOptions.find(
    (opt) => opt.value === currentStatus
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition flex items-center gap-2 text-sm sm:text-base ${
          currentStatus
            ? "bg-primary text-white hover:bg-primary-700"
            : "border-2 border-primary text-primary hover:bg-primary-50"
        }`}
      >
        {currentOption ? (
          <>
            <span>{currentOption.icon}</span>
            <span>{currentOption.label}</span>
          </>
        ) : (
          <>
            <span>➕</span>
            <span>読書リストに追加</span>
          </>
        )}
        <span className="ml-1 text-xs">▼</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 min-w-[200px]">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  setStatus.mutate({ bookId, status: option.value as any })
                }
                disabled={setStatus.isPending}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center gap-3 ${
                  currentStatus === option.value ? "bg-blue-50" : ""
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">
                    {option.label}
                  </div>
                </div>
                {currentStatus === option.value && (
                  <span className="text-primary">✓</span>
                )}
              </button>
            ))}

            {currentStatus && (
              <>
                <div className="border-t border-gray-200 my-2" />
                <button
                  onClick={() => removeStatus.mutate({ bookId })}
                  disabled={removeStatus.isPending}
                  className="w-full px-4 py-3 text-left hover:bg-red-50 transition text-red-600 font-semibold text-sm"
                >
                  ✕ ステータスを削除
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
