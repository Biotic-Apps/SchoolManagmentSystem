import { MockupActivity } from "./MockupActivity";
import { MockupChart } from "./MockupChart";
import { MockupKpis } from "./MockupKpis";
import { MockupSidebar } from "./MockupSidebar";

/** A believable eSchool admin dashboard in a browser window, drawn with divs (decorative). */
export function DashboardMockup() {
  return (
    <div aria-hidden className="overflow-hidden rounded-[18px] bg-white shadow-overlay ring-1 ring-border">
      <div className="flex items-center gap-3 border-b border-border/70 bg-[#FAF8FF] px-3.5 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#FB7185]" />
          <span className="size-2.5 rounded-full bg-[#FBBF24]" />
          <span className="size-2.5 rounded-full bg-[#A78BFA]" />
        </div>
        <div className="mx-auto flex h-6 w-full min-w-0 max-w-[260px] items-center justify-center rounded-md bg-white px-3 text-[11px] text-fg-muted ring-1 ring-border/70">
          <span className="truncate">portal.eschool.app/dashboard</span>
        </div>
        <span className="w-[42px] shrink-0" />
      </div>
      <div className="flex">
        <MockupSidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-3 bg-[#FCFBFF] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-fg sm:text-[14px]">Good morning, Principal</p>
              <p className="truncate text-[11px] text-fg-muted">Tuesday · Spring term, week 6</p>
            </div>
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-[#A78BFA] text-[11px] font-semibold text-white">
              SA
            </span>
          </div>
          <MockupKpis />
          <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr]">
            <MockupChart />
            <MockupActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
