import { MutationCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api-error";
import { commitRowFlash } from "./row-highlight";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    // Runs after the mutation's own onSuccess (which awaits its invalidations), so a saved row
    // flashes once the refetched list is on screen. See lib/row-highlight.ts.
    mutationCache: new MutationCache({
      onSettled: (data, error) => {
        if (!error) commitRowFlash(data);
      },
    }),
    defaultOptions: {
      queries: { staleTime: 30_000, retry: shouldRetry },
      mutations: { retry: false },
    },
  });
}
