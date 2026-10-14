import { Users } from "lucide-react";
import { Chips, Panel, PanelHead, Pill, StatStrip, Td, Th, type PillTone } from "../chrome/atoms";

type Status = "Paid" | "Due" | "Overdue" | "Proof sent";

const TONE: Record<Status, PillTone> = {
  Paid: "ok",
  Due: "warn",
  Overdue: "danger",
  "Proof sent": "info",
};

const CHALLANS: Array<[string, string, string, string, string, Status]> = [
  ["FC-10482", "Abdullah Rehman", "5-A", "10 Oct", "8,500", "Paid"],
  ["FC-10483", "Aiman Fatima", "5-A", "10 Oct", "8,500", "Paid"],
  ["FC-10484", "Ali Hassan", "5-A", "10 Oct", "8,500", "Overdue"],
  ["FC-10485", "Areeba Zahid", "5-A", "15 Oct", "7,650", "Proof sent"],
  ["FC-10486", "Hamza Iqbal", "5-A", "15 Oct", "8,500", "Due"],
  ["FC-10487", "Hania Sheikh", "5-A", "15 Oct", "8,500", "Paid"],
  ["FC-10488", "Ibrahim Saeed", "5-A", "10 Oct", "9,200", "Overdue"],
  ["FC-10489", "Maryam Javed", "5-A", "15 Oct", "8,500", "Due"],
];

const FAMILY: Array<[string, string, string]> = [
  ["Ahmed Khan", "Class 7-B", "9,800"],
  ["Sara Khan", "Class 5-A", "8,500"],
  ["Zain Khan", "Class 2-C", "7,200"],
];

function FamilyFee() {
  return (
    <Panel className="hidden w-[12.5em] shrink-0 flex-col @3xl:flex">
      <div className="flex items-center gap-[0.45em] border-b border-slate-200 px-[0.85em] py-[0.55em]">
        <Users className="size-[0.95em] text-brand-600" strokeWidth={2.2} />
        <span className="truncate text-[0.85em] font-semibold text-slate-800">Khan family</span>
      </div>
      <div className="divide-y divide-slate-100">
        {FAMILY.map(([name, cls, amount]) => (
          <div key={name} className="flex items-baseline gap-[0.4em] px-[0.85em] py-[0.38em]">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8em] font-medium text-slate-800">{name}</p>
              <p className="text-[0.66em] text-slate-400">{cls}</p>
            </div>
            <span className="text-[0.8em] font-semibold tabular-nums text-slate-900">{amount}</span>
          </div>
        ))}
      </div>
      <div className="space-y-[0.2em] border-t border-slate-200 px-[0.85em] py-[0.5em]">
        <div className="flex justify-between text-[0.76em] text-slate-500">
          <span>Sub-total</span>
          <span className="tabular-nums">25,500</span>
        </div>
        <div className="flex justify-between text-[0.76em] text-brand-700">
          <span>Sibling discount 10%</span>
          <span className="tabular-nums">−2,550</span>
        </div>
        <div className="flex items-baseline justify-between border-t border-slate-200 pt-[0.3em]">
          <span className="text-[0.82em] font-semibold text-slate-900">One challan</span>
          <span className="text-[1.05em] font-bold tabular-nums text-slate-900">Rs 22,950</span>
        </div>
      </div>
      <div className="px-[0.85em] pb-[0.7em]">
        <div className="grid place-items-center rounded-[0.45em] bg-brand-600 py-[0.42em] text-[0.78em] font-semibold text-white">
          Print family challan
        </div>
      </div>
    </Panel>
  );
}

export function FeesScreen() {
  return (
    <div className="flex-1 space-y-[0.65em] overflow-hidden bg-slate-50 p-[0.85em]">
      <StatStrip
        className="@2xl:grid-cols-4"
        stats={[
          { label: "Collected · Oct", value: "Rs 24,60,000", note: "1,021 challans", tone: "text-brand-700" },
          { label: "Outstanding", value: "Rs 5,38,500", note: "189 challans" },
          { label: "Overdue", value: "Rs 1,12,400", note: "42 families", tone: "text-rose-600" },
          { label: "Proofs to verify", value: "17", note: "Bank & JazzCash" },
        ]}
      />

      <div className="flex items-center gap-[0.45em] overflow-hidden">
        <Chips items={["All", "Paid", "Due", "Overdue"]} />
        <span className="ml-auto hidden shrink-0 text-[0.74em] text-slate-400 @xl:inline">October 2026 · Class 5-A</span>
      </div>

      <div className="flex gap-[0.7em]">
        <Panel className="min-w-0 flex-1">
          <PanelHead title="Fee challans" meta="Due dates this month" />
          <table className="w-full table-fixed">
            <thead>
              <tr>
                <Th className="hidden w-[9em] @xl:table-cell">Challan</Th>
                <Th>Student</Th>
                <Th className="hidden w-[7.5em] @4xl:table-cell">Due</Th>
                <Th align="right" className="w-[7.5em]">Rs</Th>
                <Th align="right" className="w-[11em]">Status</Th>
              </tr>
            </thead>
            <tbody>
              {CHALLANS.map(([no, name, , due, amount, status]) => (
                <tr key={no} className={status === "Overdue" ? "bg-rose-50/40" : undefined}>
                  <Td muted className="hidden @xl:table-cell">{no}</Td>
                  <Td strong>{name}</Td>
                  <Td muted className="hidden @4xl:table-cell">{due}</Td>
                  <Td align="right" strong>{amount}</Td>
                  <Td align="right">
                    <Pill tone={TONE[status]}>{status}</Pill>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <FamilyFee />
      </div>
    </div>
  );
}
