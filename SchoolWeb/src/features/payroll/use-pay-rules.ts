import { useCan } from "@/features/auth/use-can";
import { useServerForm } from "@/lib/use-server-form";
import { settingsSchema, toSettingsInput, type SettingsValues } from "./schemas";
import { useSavePayrollSettings } from "./settings-api";
import type { PayrollSettingsView } from "./types";

const choice = <T extends string>(value: number, options: readonly T[], fallback: T): T =>
  options.find((option) => Number(option) === value) ?? fallback;

function defaults(view: PayrollSettingsView): SettingsValues {
  return {
    workingDaysMode: view.workingDaysMode,
    fixedWorkingDays: view.fixedWorkingDays,
    perDayBase: view.perDayBase,
    latesPerDeduction: view.latesPerDeduction,
    lateDeductionDays: choice(view.lateDeductionDays, ["0.5", "1", "2"] as const, "1"),
    overtimeEnabled: view.overtimeEnabled,
    overtimeMultiplier: choice(view.overtimeMultiplier, ["1", "1.25", "1.5", "2"] as const, "1.5"),
    overtimeGraceMinutes: view.overtimeGraceMinutes,
    dailyHours: view.dailyHours === null ? "" : String(view.dailyHours),
  };
}

/** School pay rules form; only approvers (principal, admin) may change them. */
export function usePayRules(branchId: string, view: PayrollSettingsView) {
  const can = useCan();
  const save = useSavePayrollSettings(branchId);
  const server = useServerForm({
    schema: settingsSchema,
    defaultValues: defaults(view),
    onSubmit: (values) => save.mutateAsync(toSettingsInput(values)),
  });
  return { ...server, canEdit: can("payroll.approve") };
}
