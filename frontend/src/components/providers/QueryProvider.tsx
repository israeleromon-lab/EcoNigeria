"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keep observations fresh for 5 minutes (avoids redundant queries on rapid navigation)
            staleTime: 5 * 60 * 1000,
            // Keep inactive query data in memory cache for 30 minutes
            gcTime: 30 * 60 * 1000,
            // Avoid refetching all macro series on window/tab refocus
            refetchOnWindowFocus: false,
            // Automatically refresh when internet connection is restored
            refetchOnReconnect: true,
            // Retry transient network failures once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
