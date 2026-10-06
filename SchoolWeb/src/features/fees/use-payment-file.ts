import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { http } from "@/lib/http";

interface FileLinkResponse {
  fileUrl?: string | null;
  url?: string | null;
  jobId?: string | null;
}

interface FileLinkState {
  url: string | null;
  polls: number;
}

const POLL_MS = 2000;
const MAX_POLLS = 30;

/**
 * Signed link to a generated PDF (receipt, challan). The API answers with the file url, or with a
 * job id while rendering; the same endpoint is then asked again until the url is ready.
 */
export function useFileLink(path: string | null, autoStart = false) {
  const queryClient = useQueryClient();
  const [requested, setRequested] = useState(autoStart);
  const queryKey = ["fees", "file", path];
  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<FileLinkState> => {
      const previous = queryClient.getQueryData<FileLinkState>(queryKey);
      const data = (await http.get<FileLinkResponse>(path as string)).data;
      return { url: data?.fileUrl ?? data?.url ?? null, polls: (previous?.polls ?? 0) + 1 };
    },
    enabled: requested && !!path,
    retry: false,
    refetchInterval: (state) => {
      const data = state.state.data;
      if (state.state.error) return false;
      return !data || (!data.url && data.polls < MAX_POLLS) ? POLL_MS : false;
    },
  });

  const url = query.data?.url ?? null;
  const gaveUp = !url && (query.data?.polls ?? 0) >= MAX_POLLS;
  return {
    url,
    request: () => {
      if (!requested) setRequested(true);
      else {
        queryClient.setQueryData<FileLinkState>(queryKey, { url: null, polls: 0 });
        void query.refetch();
      }
    },
    preparing: requested && !url && !query.error && !gaveUp,
    failed: !!query.error || gaveUp,
    requested,
  };
}
