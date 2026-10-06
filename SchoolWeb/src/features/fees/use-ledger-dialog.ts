import { useMemo } from "react";
import { ledgerColumns } from "./ledger-columns";
import { useFeeSummary, useStudentLedger } from "./ledger-api";

/** Ledger entries with running balance plus the student's fee summary. */
export function useLedgerDialog(studentId: string | null) {
  const ledger = useStudentLedger(studentId);
  const summary = useFeeSummary(studentId);
  const columns = useMemo(() => ledgerColumns(), []);
  return { ledger, summary, columns };
}
