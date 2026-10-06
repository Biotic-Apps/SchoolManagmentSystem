import { useEffect, useMemo, useRef } from "react";
import { useCurrentUserId } from "@/features/auth/use-can";
import { sortBySent, useMarkThreadRead, useThreadMessages } from "./api";
import type { Message } from "./types";

/** Loaded messages of a thread (oldest first), marking it read once it opens. */
export function useConversation(threadId: string, readOnly: boolean) {
  const me = useCurrentUserId();
  const query = useThreadMessages(threadId, readOnly ? "branch" : undefined);
  const markRead = useMarkThreadRead();
  const marked = useRef<string | null>(null);

  const pages = query.data?.pages;
  const thread = pages?.[0]?.thread ?? null;
  const messages = useMemo(() => {
    const byId = new Map<string, Message>();
    for (const page of pages ?? []) for (const message of page.messages) byId.set(message.id, message);
    return sortBySent([...byId.values()]);
  }, [pages]);

  const { mutate } = markRead;
  useEffect(() => {
    if (readOnly || !thread || marked.current === thread.id) return;
    marked.current = thread.id;
    mutate(thread.id);
  }, [readOnly, thread, mutate]);

  return {
    query,
    thread,
    messages,
    isMine: (message: Message) => message.sender.userId === me,
    canLoadEarlier: !!query.hasNextPage,
    loadingEarlier: query.isFetchingNextPage,
    loadEarlier: () => query.fetchNextPage(),
  };
}
