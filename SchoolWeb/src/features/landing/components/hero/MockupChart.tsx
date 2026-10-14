import type { CSSProperties } from "react";

const BARS = [
  { day: "Mon", value: 88 },
  { day: "Tue", value: 94 },
  { day: "Wed", value: 91 },
  { day: "Thu", value: 97 },
  { day: "Fri", value: 93 },
  { day: "Sat", value: 96 },
];

/** Weekly attendance bars that grow in one after another. Heights are scaled from a 70% baseline. */
export function MockupChart() {
  return (
    <div className="rounded-tile bg-white p-3 ring-1 ring-inset ring-border/70">
      <div className="flex items-baseline justify-between">
        <p className="text-[12px] font-semibold text-fg">Attendance this week</p>
        <p className="text-[10px] text-fg-muted">avg 93%</p>
      </div>
      <div className="mt-3 flex h-[92px] items-end gap-2 sm:h-[104px]">
        {BARS.map((bar, i) => (
          <div key={bar.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <div
              className="animate-bar-grow w-full max-w-[22px] rounded-t-[5px] bg-gradient-to-t from-primary to-[#A78BFA]"
              style={{ height: `${(bar.value - 70) * 3}%`, "--bar-delay": `${600 + i * 90}ms` } as CSSProperties}
            />
            <span className="text-[9px] text-fg-muted">{bar.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
