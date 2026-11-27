import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useActiveChild, useIsParent } from "@/features/auth/use-active-child";
import { useSession } from "@/features/auth/session-context";
import { useThreads } from "./api";
import type { Thread } from "./types";

export type InboxScope = "own" | "branch";

/** Roles that may read every thread in their branch (read-only, audited); same set as the API's ThreadAccessService. */
const BRANCH_READERS = new Set(["PRINCIPAL", "COORDINATOR", "HEAD_TEACHER"]);

function matches(thread: Thread, term: string): boolean {
  if (!term) return true;
  const haystack = [thread.subject, thread.student.name, thread.lastMessage?.body, ...thread.participants.map((p) => p.name)];
  return haystack.some((value) => value?.toLowerCase().includes(term));
}

export function useInbox() {
  const { session } = useSession();
  const isParent = useIsParent();
  const child = useActiveChild();
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [scope, setScopeValue] = useState<InboxScope>("own");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  // `?open=<threadId>` (a notification deep link) selects that thread, then the parameter is dropped.
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const openId = params.get("open");
  const [handledOpen, setHandledOpen] = useState<string | null>(null);
  if (openId !== handledOpen) {
    setHandledOpen(openId);
    if (openId) {
      setSelectedId(openId);
      setScopeValue("own");
    }
  }
  useEffect(() => {
    if (openId) router.replace(pathname, { scroll: false });
  }, [openId, router, pathname]);

  const canReadBranch = BRANCH_READERS.has(session?.activeRole ?? "");
  const readOnly = canReadBranch && scope === "branch";
  const query = useThreads(
    {
      studentId: isParent ? child?.id : undefined,
      unread: unreadOnly || undefined,
      scope: readOnly ? "branch" : undefined,
    },
    !isParent || !!child,
  );

  const term = search.trim().toLowerCase();
  const threads = useMemo(() => (query.data ?? []).filter((thread) => matches(thread, term)), [query.data, term]);

  return {
    query,
    threads,
    search,
    setSearch,
    unreadOnly,
    setUnreadOnly,
    canReadBranch,
    scope,
    setScope: (next: InboxScope) => {
      setScopeValue(next);
      setSelectedId(null);
    },
    readOnly,
    selectedId,
    select: setSelectedId,
    back: () => setSelectedId(null),
    composing,
    setComposing,
  };
}

export type InboxState = ReturnType<typeof useInbox>;
