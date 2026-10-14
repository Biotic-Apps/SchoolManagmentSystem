import { BookOpen, CalendarCheck, Receipt } from "lucide-react";

/** Parent home: child card, attendance, latest diary and fee due. */
export function PhoneScreenParent() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="leading-tight">
        <p className="text-[10px] text-fg-muted">Good morning</p>
        <p className="text-[13px] font-bold text-fg">Mrs. Khan</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-[#7B68EE] to-[#5B4BC7] p-3 text-white shadow-raised">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-white/20 text-[11px] font-bold">AK</span>
          <div className="leading-tight">
            <p className="text-[12px] font-semibold">Ayesha Khan</p>
            <p className="text-[9px] text-white/75">Class 5-A · Roll 01</p>
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[9px] text-white/75">Attendance this month</p>
            <p className="text-[20px] font-bold leading-none">96%</p>
          </div>
          <CalendarCheck className="size-5 text-white/80" />
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-white/20">
          <div className="h-full w-[96%] rounded-full bg-white" />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-2.5 shadow-card">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary">
          <BookOpen className="size-3" /> Latest diary
        </div>
        <p className="mt-1 text-[11px] font-medium text-fg">Maths: Exercise 4.2, Q1–Q8</p>
        <p className="text-[9px] text-fg-muted">English: learn the poem by Thursday</p>
      </div>

      <div className="rounded-2xl bg-white p-2.5 shadow-card">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-accent-pink">
          <Receipt className="size-3" /> Fee due
        </div>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-[11px] font-medium text-fg">October challan</p>
          <span className="rounded-full bg-selected px-2 py-0.5 text-[9px] font-semibold text-on-selected">Due 20 Oct</span>
        </div>
      </div>
    </div>
  );
}
