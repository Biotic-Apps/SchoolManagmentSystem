import { FileText, ImageIcon } from "lucide-react";
import type { Attachment } from "@/features/files/types";
import { cn } from "@/lib/cn";

interface AttachmentListProps {
  items: Attachment[] | null | undefined;
  className?: string;
}

/** Links to attached files (signed URLs open in a new tab). */
export function AttachmentList({ items, className }: AttachmentListProps) {
  if (!items?.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => {
        const Icon = item.mime.startsWith("image/") ? ImageIcon : FileText;
        return (
          <li key={item.id} className="min-w-0 max-w-full">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center gap-1.5 rounded-input border border-border bg-surface px-2.5 py-1 text-caption text-fg hover:bg-selected/60"
            >
              <Icon className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{item.name}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
