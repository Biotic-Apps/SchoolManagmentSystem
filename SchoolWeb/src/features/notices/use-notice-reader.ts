import { useState } from "react";
import { useMarkNoticeRead } from "./api";
import type { Notice } from "./types";

/** Opens a notice in the drawer and records the read once per notice. */
export function useNoticeReader() {
  const [open, setOpen] = useState<Notice | null>(null);
  const [marked, setMarked] = useState<ReadonlySet<string>>(new Set());
  const markRead = useMarkNoticeRead();

  const show = (notice: Notice) => {
    setOpen(notice);
    if (notice.read || marked.has(notice.id)) return;
    setMarked((current) => new Set(current).add(notice.id));
    markRead.mutate(notice.id);
  };

  return {
    notice: open,
    show,
    isUnread: (notice: Notice) => !notice.read && !marked.has(notice.id),
    onOpenChange: (next: boolean) => {
      if (!next) setOpen(null);
    },
  };
}

export type NoticeReader = ReturnType<typeof useNoticeReader>;
