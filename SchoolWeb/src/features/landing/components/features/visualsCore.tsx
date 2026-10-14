import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { MiniPill, MiniWindow } from "./MiniWindow";

const setupSteps = ["School details", "Main branch", "Principal", "Session 2026–27", "Classes 1 – 10"];

export function AdminVisual() {
  return (
    <MiniWindow title="School setup" badge={<MiniPill>One form</MiniPill>}>
      <ul className="flex flex-col gap-2">
        {setupSteps.map((step, i) => (
          <li
            key={step}
            className="flex items-center gap-2.5 text-caption text-fg"
            style={{ animation: "rise-in 420ms var(--motion-ease-decelerate) backwards", animationDelay: `${200 + i * 90}ms` }}
          >
            <span className="grid size-5 place-items-center rounded-full bg-primary text-white">
              <Check className="size-3" strokeWidth={3} />
            </span>
            {step}
          </li>
        ))}
      </ul>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-selected">
        <div className="h-full w-full rounded-full bg-linear-to-r from-primary to-accent-pink" />
      </div>
    </MiniWindow>
  );
}

const applicants = [
  { initials: "AK", name: "w-24", status: "Approved", tone: "purple" as const },
  { initials: "SR", name: "w-20", status: "Pending", tone: "pink" as const },
  { initials: "ZM", name: "w-28", status: "Approved", tone: "purple" as const },
];

export function PeopleVisual() {
  return (
    <MiniWindow title="Admissions" badge={<MiniPill tone="pink">3 new</MiniPill>}>
      <ul className="flex flex-col gap-2.5">
        {applicants.map((a, i) => (
          <li
            key={a.initials}
            className="flex items-center gap-2.5 rounded-lg bg-background/60 p-2"
            style={{ animation: "rise-in 420ms var(--motion-ease-decelerate) backwards", animationDelay: `${200 + i * 110}ms` }}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-linear-to-br from-primary to-[#a78bfa] text-[10px] font-bold text-white">
              {a.initials}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className={cn("h-2 max-w-full rounded-full bg-fg/15", a.name)} />
              <span className="h-1.5 w-14 rounded-full bg-fg/10" />
            </span>
            <MiniPill tone={a.tone}>{a.status}</MiniPill>
          </li>
        ))}
      </ul>
    </MiniWindow>
  );
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const slots = [
  ["bg-primary/80", "bg-accent-cyan/60", "bg-primary/80", "bg-accent-pink/60", "bg-primary/40"],
  ["bg-accent-pink/60", "bg-primary/40", "bg-accent-cyan/60", "bg-primary/80", "bg-accent-cyan/60"],
  ["bg-primary/40", "bg-primary/80", "bg-accent-pink/60", "bg-primary/40", "bg-primary/80"],
];

export function AcademicsVisual() {
  return (
    <MiniWindow title="Timetable · Class 6-A" badge={<MiniPill>Draft → Published</MiniPill>}>
      <div className="grid grid-cols-5 gap-1.5">
        {days.map((d) => (
          <span key={d} className="text-center text-[10px] font-semibold text-fg-muted">
            {d}
          </span>
        ))}
        {slots.flatMap((row, r) =>
          row.map((color, c) => (
            <span
              key={`${r}-${c}`}
              className={cn("h-6 rounded-md", color)}
              style={{ animation: "rise-in 380ms var(--motion-ease-decelerate) backwards", animationDelay: `${150 + (r * 5 + c) * 30}ms` }}
            />
          )),
        )}
      </div>
    </MiniWindow>
  );
}
