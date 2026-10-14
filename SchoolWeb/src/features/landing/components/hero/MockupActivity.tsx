import { BookOpen, FileCheck2, UserPlus } from "lucide-react";

const ACTIVITY = [
  { icon: UserPlus, text: "New admission · Grade 2", time: "2m" },
  { icon: BookOpen, text: "Diary posted · 7-B Science", time: "14m" },
  { icon: FileCheck2, text: "Mid-term results published", time: "1h" },
];

export function MockupActivity() {
  return (
    <div className="rounded-tile bg-white p-3 ring-1 ring-inset ring-border/70">
      <p className="text-[12px] font-semibold text-fg">Recent activity</p>
      <ul className="mt-2.5 flex flex-col gap-2">
        {ACTIVITY.map(({ icon: Icon, text, time }) => (
          <li key={text} className="flex items-center gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-selected text-primary">
              <Icon className="size-3" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[11px] text-fg">{text}</span>
            <span className="text-[10px] text-fg-muted">{time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
