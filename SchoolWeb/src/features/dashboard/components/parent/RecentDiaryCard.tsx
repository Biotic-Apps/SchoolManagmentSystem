import { NotebookPen } from "lucide-react";
import { AttachmentList } from "@/components/shared/AttachmentList";
import { Badge } from "@/components/ui/Badge";
import type { DiaryEntry } from "@/features/diary/types";
import { formatDate } from "@/lib/format";
import { TodayCard } from "../TodayCard";

/** The last week's published diary, newest first, with homework called out. */
export function RecentDiaryCard({ entries, href }: { entries: DiaryEntry[]; href: string | null }) {
  return (
    <TodayCard title="Diary & homework" icon={NotebookPen} href={href} linkLabel="Full diary">
      {entries.length === 0 ? (
        <p className="text-label text-fg-muted">
          Nothing from the teachers this week yet. Each day&apos;s classwork and homework appear here once published.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {entries.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-label font-semibold text-fg">{entry.subject.name}</span>
                <span className="shrink-0 text-caption text-fg-muted">{formatDate(entry.date)}</span>
              </div>
              <p className="line-clamp-2 whitespace-pre-line text-label text-fg-muted">{entry.topics}</p>
              {entry.homework && (
                <div className="flex flex-col gap-1 rounded-input bg-selected px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="info">Homework</Badge>
                    {entry.dueDate && <span className="text-caption text-fg-muted">Due {formatDate(entry.dueDate)}</span>}
                  </div>
                  <p className="line-clamp-3 whitespace-pre-line text-label text-fg">{entry.homework}</p>
                </div>
              )}
              <AttachmentList items={entry.attachments} />
            </li>
          ))}
        </ul>
      )}
    </TodayCard>
  );
}
