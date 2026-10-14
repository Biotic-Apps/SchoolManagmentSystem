import { TrendingUp } from "lucide-react";

const KPIS = [
  { label: "Students", value: "1,248", trend: "+36 this term" },
  { label: "Attendance today", value: "96%", trend: "+2.1% vs avg" },
  { label: "Fees collected", value: "Rs 2.4M", trend: "82% of target" },
];

export function MockupKpis() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {KPIS.map((kpi) => (
        <div key={kpi.label} className="min-w-0 rounded-tile bg-card-bg/60 p-2 ring-1 ring-inset ring-border/60 sm:p-3">
          <p className="truncate text-[10px] font-medium text-on-selected/80 sm:text-[11px]">{kpi.label}</p>
          <p className="mt-0.5 truncate text-[15px] font-bold tracking-tight text-fg sm:text-[20px]">{kpi.value}</p>
          <p className="mt-0.5 hidden items-center gap-1 text-[10px] font-medium text-primary sm:flex">
            <TrendingUp className="size-3 shrink-0" />
            <span className="truncate">{kpi.trend}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
