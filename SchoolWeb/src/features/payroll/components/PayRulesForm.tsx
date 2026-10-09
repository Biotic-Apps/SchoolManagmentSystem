"use client";

import { FormProvider, useWatch } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { FormPanel } from "@/components/shared/FormPanel";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { NumberField } from "@/components/shared/form/NumberField";
import { SegmentedField } from "@/components/shared/form/SegmentedField";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import type { PayrollSettingsView } from "../types";
import { usePayRules } from "../use-pay-rules";
import { PayRulesExample } from "./PayRulesExample";

const WORKING_DAYS = [
  { id: "CALENDAR", name: "School calendar" },
  { id: "FIXED", name: "Fixed number" },
];
const PER_DAY = [
  { id: "GROSS", name: "Gross salary" },
  { id: "BASIC", name: "Basic only" },
];
const LATE_DAYS = [
  { id: "0.5", name: "Half day" },
  { id: "1", name: "1 day" },
  { id: "2", name: "2 days" },
];
const MULTIPLIERS = [
  { id: "1", name: "1×" },
  { id: "1.25", name: "1.25×" },
  { id: "1.5", name: "1.5×" },
  { id: "2", name: "2×" },
];

/** School-wide pay rules with plain-English hints and a live example. */
export function PayRulesForm({ branchId, view }: { branchId: string; view: PayrollSettingsView }) {
  const rules = usePayRules(branchId, view);
  const { form } = rules;
  const mode = useWatch({ control: form.control, name: "workingDaysMode" });
  const overtime = useWatch({ control: form.control, name: "overtimeEnabled" });
  const branchHours = view.staffArrivesAt && view.staffLeavesAt ? `${view.staffArrivesAt} – ${view.staffLeavesAt} = ${view.branchDailyHours} h` : null;

  return (
    <FormProvider {...form}>
      <form onSubmit={rules.submit} noValidate className="flex flex-col gap-4">
        {!view.saved && <InlineNotice>These are the default rules. Change anything and save to make them your school&apos;s own.</InlineNotice>}
        {!rules.canEdit && <InlineNotice>Only the principal or an admin can change pay rules.</InlineNotice>}
        <fieldset disabled={!rules.canEdit} className="grid gap-4 lg:grid-cols-2">
          <FormPanel title="Working days" description="A day's salary = monthly salary ÷ working days. Used for absences and lates.">
            <SegmentedField
              name="workingDaysMode"
              label="Count working days from"
              options={WORKING_DAYS}
              hint={(value) =>
                value === "FIXED"
                  ? "Every month uses the same number of days."
                  : "Working days of the month on the school calendar (weekly offs and holidays left out)."
              }
            />
            {mode === "FIXED" && <NumberField name="fixedWorkingDays" label="Working days a month" min={1} max={31} />}
            <SegmentedField
              name="perDayBase"
              label="A day's salary is based on"
              options={PER_DAY}
              hint={(value) => (value === "BASIC" ? "Basic salary only." : "Basic salary + allowances.")}
            />
          </FormPanel>
          <FormPanel title="Late arrivals" description="Lates marked in staff attendance add up during the month.">
            <NumberField name="latesPerDeduction" label="Lates allowed before a deduction" min={0} max={31} hint="0 = lates are never deducted." />
            <SegmentedField name="lateDeductionDays" label="Each time, deduct" options={LATE_DAYS} />
          </FormPanel>
          <FormPanel title="Overtime" description="Extra time after the staff leave time, or added by hand. Paid only after approval.">
            <CheckboxField name="overtimeEnabled" label="Pay overtime" hint="Off = overtime is recorded but not paid." />
            {overtime && (
              <>
                <SegmentedField
                  name="overtimeMultiplier"
                  label="Overtime pays"
                  options={MULTIPLIERS}
                  hint={() => "Times the normal hourly pay (basic ÷ working days ÷ hours a day)."}
                />
                <NumberField
                  name="overtimeGraceMinutes"
                  label="Minutes after leave time before overtime counts"
                  min={0}
                  max={240}
                  hint="Staying a few minutes late is not overtime."
                />
                <TextField
                  name="dailyHours"
                  label="Paid hours a day"
                  inputMode="decimal"
                  placeholder={view.branchDailyHours ? String(view.branchDailyHours) : "8"}
                  hint={branchHours ? `Leave empty to use the branch staff timings (${branchHours}).` : "Leave empty to use 8 hours."}
                />
              </>
            )}
            <p className="text-caption text-fg-muted">A fixed hourly rate can also be set on one person&apos;s salary.</p>
          </FormPanel>
          <PayRulesExample view={view} />
        </fieldset>
        <FormAlert message={rules.formError} />
        {rules.canEdit && (
          <div className="flex justify-end">
            <Button type="submit" loading={rules.submitting}>
              Save pay rules
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
