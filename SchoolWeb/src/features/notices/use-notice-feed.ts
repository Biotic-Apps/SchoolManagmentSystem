import { useSession } from "@/features/auth/session-context";
import { menuFor } from "@/lib/permissions";
import { useNoticeFeedQuery } from "./api";
import { sortFeed } from "./options";
import { useNoticeReader } from "./use-notice-reader";

/** Published notices addressed to me, pinned first; `limit` for the dashboard card. */
export function useNoticeFeed(limit?: number) {
  const { session } = useSession();
  const query = useNoticeFeedQuery();
  const reader = useNoticeReader();
  const sorted = sortFeed((query.data ?? []).filter((notice) => notice.status === "PUBLISHED"));

  return {
    query,
    reader,
    notices: limit ? sorted.slice(0, limit) : sorted,
    hasMore: !!limit && sorted.length > limit,
    /** "View all" only when the role's menu has Notices. */
    hasNoticesMenu: menuFor(session).some((item) => item.id === "notices"),
  };
}
