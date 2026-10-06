import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useBranchPicker } from "@/features/branches/use-branch-picker";

export type FeesTabId =
  | "overview"
  | "invoices"
  | "payments"
  | "proofs"
  | "dues"
  | "collections"
  | "concessions"
  | "structure";

export const FEES_TABS: { id: FeesTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "invoices", label: "Invoices" },
  { id: "payments", label: "Payments" },
  { id: "proofs", label: "Payment proofs" },
  { id: "dues", label: "Dues" },
  { id: "collections", label: "Daily collections" },
  { id: "concessions", label: "Concessions" },
  { id: "structure", label: "Fee structure" },
];

/** Staff fees screen: one branch shared by every tab. */
export function useFeesPage() {
  const can = useCan();
  const picker = useBranchPicker();
  const [tab, setTab] = useState<FeesTabId>("overview");
  const canView = can("fees.view");

  return {
    picker,
    branchId: picker.branchId,
    schoolId: picker.schoolId,
    tab,
    setTab: (value: string) => setTab(value as FeesTabId),
    tabs: canView ? FEES_TABS : [],
  };
}
