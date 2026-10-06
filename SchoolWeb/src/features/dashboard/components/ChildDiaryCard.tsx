import { AttachmentList } from "@/components/shared/AttachmentList";
import type { DiaryEntry } from "@/features/diary/types";
import { formatDate } from "@/lib/format";
import { TodayCard } from "./TodayCard";

export function ChildDiaryCard({ entries, href }: { entries: DiaryEntry[]; href: string | null }) {
  return (
    <TodayCard title="Today's diary" href={href} linkLabel="Diary">
      {entries.length === 0 ? (
        <p className="text-label text-fg-muted">No diary entries published yet today.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {entries.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
              <span className="text-label font-semibold text-fg">{entry.subject.name}</span>
              <p className="whitespace-pre-line text-label text-fg">{entry.topics}</p>
              {entry.homework && (
                <p className="whitespace-pre-line text-label text-fg">
                  <span className="font-medium">Homework: </span>
                  {entry.homework}
                  {entry.dueDate && <span className="text-fg-muted"> (due {formatDate(entry.dueDate)})</span>}
                </p>
              )}
              <AttachmentList items={entry.attachments} />
            </li>
          ))}
        </ul>
      )}
    </TodayCard>
  );
}
