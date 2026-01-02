"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import superjson from "superjson";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5分間キャッシュ
        gcTime: 10 * 60 * 1000, // 10分間メモリ保持（旧cacheTime）
        refetchOnWindowFocus: false, // フォーカス時の再フェッチを無効化
        refetchOnReconnect: true, // 再接続時のみ再フェッチ
        retry: 1, // リトライ回数を1回に制限
      },
    },
  }));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}
