import { Badge } from "@/components/ui/Badge";
import { TodayCard } from "./TodayCard";

interface DiaryRow {
  key: string;
  section: string;
  subject: string | null;
}

export function TeacherDiariesCard({ diaries, href }: { diaries: DiaryRow[]; href: string | null }) {
  return (
    <TodayCard title="Diaries to write" href={href} linkLabel="Diary">
      {diaries.length === 0 ? (
        <p className="text-label text-fg-muted">All of today&apos;s diaries are done.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {diaries.map((diary) => (
            <li key={diary.key} className="flex items-center justify-between gap-3">
              <span className="truncate text-label text-fg">
                {diary.section}
                {diary.subject && <span className="text-fg-muted"> · {diary.subject}</span>}
              </span>
              <Badge tone="warning">Pending</Badge>
            </li>
          ))}
        </ul>
      )}
    </TodayCard>
  );
}
