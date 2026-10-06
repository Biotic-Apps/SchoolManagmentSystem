import type { Notice } from "@/features/notices/types";
import { formatDate } from "@/lib/format";
import { TodayCard } from "./TodayCard";

export function ChildNoticesCard({ notices, href }: { notices: Notice[]; href: string | null }) {
  return (
    <TodayCard title="Notices" href={href} linkLabel="All notices">
      {notices.length === 0 ? (
        <p className="text-label text-fg-muted">No new notices.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notices.map((notice) => (
            <li key={notice.id} className="flex items-center justify-between gap-3">
              <span className="truncate text-label font-medium text-fg">{notice.title}</span>
              <span className="shrink-0 whitespace-nowrap text-caption text-fg-muted">
                {formatDate(notice.publishedAt ?? notice.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </TodayCard>
  );
}
