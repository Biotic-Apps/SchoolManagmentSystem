"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/shared/Toaster";
import { makeQueryClient } from "@/lib/query-client";
import { SessionProvider } from "@/features/auth/session-context";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
