import { CloudOff } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { Chips, Panel, StatStrip, Td, Th } from "../chrome/atoms";

type Mark = "P" | "A" | "L";

const REGISTER: Array<[string, string, string, Mark, string]> = [
  ["01", "Abdullah Rehman", "5A-2301", "P", "8:02 AM"],
  ["02", "Aiman Fatima", "5A-2302", "P", "7:58 AM"],
  ["03", "Ali Hassan", "5A-2303", "A", "SMS sent"],
  ["04", "Areeba Zahid", "5A-2304", "P", "8:05 AM"],
  ["05", "Fatima Noor", "5A-2305", "L", "Sick leave"],
  ["06", "Hamza Iqbal", "5A-2306", "P", "8:01 AM"],
  ["07", "Hania Sheikh", "5A-2307", "P", "7:55 AM"],
  ["08", "Ibrahim Saeed", "5A-2308", "P", "8:09 AM"],
  ["09", "Maryam Javed", "5A-2309", "P", "8:00 AM"],
  ["10", "Muhammad Ahmed", "5A-2310", "P", "8:04 AM"],
];

const MARK_STYLE: Record<Mark, string> = {
  P: "bg-brand-600 text-white",
  A: "bg-rose-500 text-white",
  L: "bg-amber-400 text-white",
};

const LABEL: Record<Mark, string> = { P: "Present", A: "Absent", L: "Leave" };

function Toggle({ value }: { value: Mark }) {
  return (
    <div className="inline-flex overflow-hidden rounded-[0.4em] border border-slate-200">
      {(["P", "A", "L"] as const).map((m) => (
        <span
          key={m}
          className={cn(
            "px-[0.55em] py-[0.12em] text-[0.9em] font-semibold",
            m === value ? MARK_STYLE[m] : "bg-white text-slate-400",
          )}
        >
          {/* Full word on a wide frame, initial on a narrow one. */}
          <span className="@3xl:hidden">{m}</span>
          <span className="hidden @3xl:inline">{LABEL[m]}</span>
        </span>
      ))}
    </div>
  );
}

export function AttendanceScreen() {
  return (
    <div className="flex-1 space-y-[0.65em] overflow-hidden bg-slate-50 p-[0.85em]">
      <div className="flex items-center gap-[0.45em] overflow-hidden">
        <Chips items={["Class 5-A", "5-B", "5-C"]} />
        <span className="hidden shrink-0 rounded-[0.45em] border border-slate-200 bg-white px-[0.7em] py-[0.38em] text-[0.78em] text-slate-500 @2xl:inline">
          Wed, 14 Oct 2026
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-[0.35em] rounded-full border border-amber-200 bg-amber-50 px-[0.7em] py-[0.32em] text-[0.74em] font-semibold text-amber-700">
          <CloudOff className="size-[0.95em]" strokeWidth={2.2} />
          <span>Saved offline, will sync</span>
        </span>
      </div>

      <StatStrip
        narrowCols={4}
        stats={[
          { label: "On roll", value: "40" },
          { label: "Present", value: "37", tone: "text-brand-700" },
          { label: "Absent", value: "2", tone: "text-rose-600" },
          { label: "Leave", value: "1", tone: "text-amber-600" },
        ]}
      />

      <Panel>
        <div className="flex items-center justify-between border-b border-slate-200 px-[0.85em] py-[0.5em]">
          <span className="truncate text-[0.85em] font-semibold text-slate-800">
            Register · Class 5-A · Ms. Hira Aslam
          </span>
          <span className="hidden shrink-0 text-[0.72em] text-slate-400 @xl:inline">Period 1 · 8:00 AM</span>
        </div>
        <table className="w-full table-fixed">
          <thead>
            <tr>
              <Th className="w-[4.6em]">Roll</Th>
              <Th>Student</Th>
              <Th className="hidden w-[9.5em] @3xl:table-cell">Adm. no</Th>
              <Th className="hidden w-[10em] @2xl:table-cell">Arrived</Th>
              <Th align="right" className="w-[10.5em] @3xl:w-[19em]">Mark</Th>
            </tr>
          </thead>
          <tbody>
            {REGISTER.map(([roll, name, adm, mark, arrived]) => (
              <tr key={roll} className={mark === "A" ? "bg-rose-50/40" : undefined}>
                <Td muted>{roll}</Td>
                <Td strong>{name}</Td>
                <Td muted className="hidden @3xl:table-cell">{adm}</Td>
                <Td muted className="hidden @2xl:table-cell">{arrived}</Td>
                <Td align="right">
                  <Toggle value={mark} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
