import type { SchoolDayMoment } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";
import { DAY_ICONS } from "./dayIcons";
import { MiniUi } from "./MiniUi";

type DayCardProps = {
  moment: SchoolDayMoment;
  color: string;
  className?: string;
};

/** One moment of the school day: the time, what happens, and a tiny live screen. */
export function DayCard({ moment, color, className }: DayCardProps) {
  const Icon = DAY_ICONS[moment.mini];
  const [clock, meridiem] = moment.time.split(" ");

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-panel border border-line bg-white p-5 shadow-lift",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold leading-none tracking-[-0.04em] text-foreground">
          <span className="text-[2.1rem] tabular-nums">{clock}</span>
          <span className="ml-1 text-[0.95rem] tracking-normal" style={{ color }}>
            {meridiem}
          </span>
        </p>
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white"
          style={{ backgroundColor: color }}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <h3 className="mt-4 text-[1.05rem] font-semibold tracking-[-0.01em] text-foreground">
        {moment.title}
      </h3>
      <p className="mt-1.5 mb-4 text-[0.9rem] leading-[1.55] text-muted">{moment.body}</p>
      <div className="mt-auto">
        <MiniUi kind={moment.mini} labels={moment.labels} color={color} />
      </div>
    </article>
  );
}
