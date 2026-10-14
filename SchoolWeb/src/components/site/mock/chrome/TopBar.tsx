import { Bell, CalendarDays, ChevronDown, Search } from "lucide-react";

export function TopBar({
  title,
  crumb,
  branch = "Main Campus",
}: {
  title: string;
  crumb: string;
  /** Text on the branch picker; the parent portal shows the child instead. */
  branch?: string;
}) {
  return (
    <header className="flex items-center gap-[0.7em] border-b border-slate-200 bg-white px-[1em] py-[0.6em]">
      <div className="min-w-0">
        <p className="truncate text-[0.68em] uppercase tracking-[0.1em] text-slate-400">{crumb}</p>
        {/* Not a heading. This is a picture of a page title, and the home page
            carries many of these mocks — as `<h1>` they would wreck the
            document outline before a word of real copy was reached. */}
        <p className="truncate text-[1em] font-semibold tracking-tight text-slate-900">{title}</p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-[0.4em] rounded-[0.45em] border border-brand-100 bg-brand-50 px-[0.6em] py-[0.35em] @xl:ml-[0.8em]">
        <CalendarDays className="size-[0.8em] text-brand-400" strokeWidth={2} />
        <span className="whitespace-nowrap text-[0.76em] font-semibold text-brand-900">Session 2026–27</span>
        <span className="hidden text-[0.76em] text-brand-300 @lg:inline">·</span>
        <span className="hidden whitespace-nowrap text-[0.76em] font-semibold text-brand-900 @lg:inline">
          Wed, 14 Oct
        </span>
      </div>

      <div className="ml-auto hidden items-center gap-[0.5em] @3xl:flex">
        <div className="flex w-[9.5em] items-center gap-[0.4em] rounded-[0.45em] border border-slate-200 px-[0.55em] py-[0.35em]">
          <Search className="size-[0.78em] text-slate-400" strokeWidth={2} />
          <span className="whitespace-nowrap text-[0.74em] text-slate-400">Search students</span>
        </div>
        <div className="flex items-center gap-[0.35em] rounded-[0.45em] border border-slate-200 px-[0.55em] py-[0.35em]">
          <span className="whitespace-nowrap text-[0.74em] font-medium text-slate-600">{branch}</span>
          <ChevronDown className="size-[0.75em] text-slate-400" strokeWidth={2.2} />
        </div>
        <span className="relative">
          <Bell className="size-[0.95em] text-slate-400" strokeWidth={2} />
          <span className="absolute -right-[0.1em] -top-[0.1em] size-[0.4em] rounded-full bg-accent-500" />
        </span>
      </div>
    </header>
  );
}
