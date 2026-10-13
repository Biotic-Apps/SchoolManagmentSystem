import { FileText } from "lucide-react";
import type { Attachment } from "@/features/files/types";
import { cn } from "@/lib/cn";

interface AttachmentListProps {
  items: Attachment[] | null | undefined;
  className?: string;
}

/** Renders attached files: inline image previews for images, icon links for other files. */
export function AttachmentList({ items, className }: AttachmentListProps) {
  if (!items?.length) return null;

  const images = items.filter((i) => i.mime.startsWith("image/"));
  const files = items.filter((i) => !i.mime.startsWith("image/"));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <a
              key={img.id}
              href={img.url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-lg border border-border"
            >
              <img
                src={img.url}
                alt={img.name}
                className="max-h-48 max-w-full rounded-lg object-contain"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((item) => (
            <li key={item.id} className="min-w-0 max-w-full">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-1.5 rounded-input border border-border bg-surface px-2.5 py-1 text-caption text-fg hover:bg-selected/60"
              >
                <FileText className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
