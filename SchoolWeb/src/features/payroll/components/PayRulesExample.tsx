import { useWatch } from "react-hook-form";
import { formatMoney } from "@/lib/format";
import type { SettingsValues } from "../schemas";
import type { PayrollSettingsView } from "../types";

// A sample salary so the rules read as real money.
const BASIC = 6_000_000;
const ALLOWANCES = 1_100_000;
const CALENDAR_DAYS = 26;

/** Live worked example of the rules being edited. */
export function PayRulesExample({ view }: { view: PayrollSettingsView }) {
  const v = useWatch() as SettingsValues;
  const days = v.workingDaysMode === "FIXED" ? v.fixedWorkingDays : CALENDAR_DAYS;
  const base = v.perDayBase === "BASIC" ? BASIC : BASIC + ALLOWANCES;
  const perDay = Math.round(base / Math.max(1, days));
  const hours = v.dailyHours ? Number(v.dailyHours) : (view.branchDailyHours ?? 8);
  const hourly = Math.round((BASIC / Math.max(1, days * hours)) * Number(v.overtimeMultiplier));
  const lateDays = Number(v.lateDeductionDays);
  return (
    <section className="flex flex-col gap-2 rounded-lg bg-background p-4 text-label text-fg-muted">
      <h4 className="font-semibold text-fg">Example</h4>
      <p>
        A teacher on {formatMoney(BASIC)} basic + {formatMoney(ALLOWANCES)} allowances
        {v.workingDaysMode === "FIXED" ? ` (${days} working days)` : ` in a month with ${days} working days`}:
      </p>
      <ul className="flex list-disc flex-col gap-1 pl-5">
        <li>One absent day costs {formatMoney(perDay)}.</li>
        <li>
          {v.latesPerDeduction > 0
            ? `Every ${v.latesPerDeduction} late arrivals cost ${lateDays === 0.5 ? "half a day" : `${lateDays} ${lateDays === 1 ? "day" : "days"}`} (${formatMoney(Math.round(perDay * lateDays))}).`
            : "Late arrivals are not deducted."}
        </li>
        <li>Approved paid leave is never deducted; approved unpaid leave costs a day like an absence.</li>
        <li>
          {v.overtimeEnabled
            ? `One hour of approved overtime pays ${formatMoney(hourly)} (${hours} paid hours a day × ${v.overtimeMultiplier}).`
            : "Overtime is not paid."}
        </li>
      </ul>
    </section>
  );
}
