import { ArrowLeft, CloudOff } from "lucide-react";
import { cn } from "@/lib/cn";

const STUDENTS = [
  { name: "Ayesha Khan", roll: "01", present: true },
  { name: "Bilal Ahmed", roll: "02", present: true },
  { name: "Fatima Noor", roll: "03", present: false },
  { name: "Hamza Ali", roll: "04", present: true },
  { name: "Maryam Raza", roll: "05", present: true },
];

/** Teacher marking attendance for class 5-A while offline. */
export function PhoneScreenAttendance() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-full bg-white shadow-card">
          <ArrowLeft className="size-3.5 text-fg" />
        </span>
        <div className="leading-tight">
          <p className="text-[13px] font-bold text-fg">Attendance</p>
          <p className="text-[10px] text-fg-muted">Class 5-A · Tue, 14 Oct</p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start rounded-full bg-selected px-2.5 py-1 text-[10px] font-semibold text-on-selected">
        <span className="relative flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/60 motion-reduce:animate-none" />
          <span className="relative size-2 rounded-full bg-primary" />
        </span>
        <CloudOff className="size-3" />
        Saved offline · will sync
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center">
        {[
          ["32", "Present", "text-primary"],
          ["2", "Absent", "text-accent-pink"],
          ["34", "Total", "text-fg"],
        ].map(([n, label, color]) => (
          <div key={label} className="rounded-xl bg-white py-1.5 shadow-card">
            <p className={cn("text-[14px] font-bold", color)}>{n}</p>
            <p className="text-[9px] text-fg-muted">{label}</p>
          </div>
        ))}
      </div>

      <ul className="flex flex-col gap-1.5">
        {STUDENTS.map((s) => (
          <li key={s.roll} className="flex items-center gap-2 rounded-xl bg-white px-2 py-1.5 shadow-card">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-card-bg text-[9px] font-bold text-on-selected">
              {s.roll}
            </span>
            <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-fg">{s.name}</span>
            <span className="flex shrink-0 overflow-hidden rounded-full bg-[#F1EEFB] text-[9px] font-semibold">
              <span className={cn("px-2 py-0.5", s.present ? "bg-primary text-white" : "text-fg-muted")}>P</span>
              <span className={cn("px-2 py-0.5", !s.present ? "bg-accent-pink text-white" : "text-fg-muted")}>A</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto rounded-xl bg-primary py-2 text-center text-[11px] font-semibold text-white shadow-raised">
        Save attendance
      </div>
    </div>
  );
}
