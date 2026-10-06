import type { Option } from "@/components/shared/OptionSelect";
import type { FeeFrequency, FeePlan } from "./types";

export const FEE_HEAD_KIND_OPTIONS: Option[] = [
  { id: "RECURRING", name: "Recurring" },
  { id: "ONE_TIME", name: "One-time" },
];

export const FEE_FREQUENCY_OPTIONS: { id: FeeFrequency; name: string }[] = [
  { id: "MONTHLY", name: "Monthly" },
  { id: "QUARTERLY", name: "Quarterly" },
  { id: "TERM", name: "Per term" },
  { id: "YEARLY", name: "Yearly" },
  { id: "ONCE", name: "Once" },
];

export const DUE_DAY_OPTIONS: Option[] = Array.from({ length: 28 }, (_, index) => ({
  id: String(index + 1),
  name: `Day ${index + 1}`,
}));

/** Plans already in force; anything else can still be approved. */
const SETTLED_PLAN_STATUSES = new Set(["APPROVED", "ACTIVE", "ARCHIVED", "INACTIVE"]);

export function canApprovePlan(plan: FeePlan): boolean {
  return !SETTLED_PLAN_STATUSES.has(plan.status);
}

/** Sum of the plan's monthly items. */
export function monthlyTotalMinor(plan: FeePlan): number {
  return plan.items.filter((item) => item.frequency === "MONTHLY").reduce((sum, item) => sum + item.amountMinor, 0);
}
