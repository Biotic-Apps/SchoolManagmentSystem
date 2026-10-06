import type { ImportDetail } from "./import-types";
import { humanizeKey, isMoneyKey } from "./preview-columns";

const CREATED_KEYS = ["created", "rowsCreated", "createdCount", "imported", "importedRows"];
const SKIPPED_KEYS = ["skipped", "rowsSkipped", "skippedCount"];
const TOTAL_KEYS = ["fileTotalMinor", "importedTotalMinor"];

function firstNumber(source: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) if (typeof source[key] === "number") return source[key] as number;
  return null;
}

export interface ReconciliationExtra {
  label: string;
  value: unknown;
  money: boolean;
}

/** Created/skipped counts, money totals and any further fields of a committed import's report. */
export function reconciliationView(detail: ImportDetail) {
  const report = detail.reconciliation ?? {};
  const created = firstNumber(report, CREATED_KEYS) ?? detail.totals.valid;
  const skipped = firstNumber(report, SKIPPED_KEYS) ?? detail.totals.invalid;
  const fileTotal = typeof report.fileTotalMinor === "number" ? report.fileTotalMinor : null;
  const importedTotal = typeof report.importedTotalMinor === "number" ? report.importedTotalMinor : null;
  const known = new Set([...CREATED_KEYS, ...SKIPPED_KEYS, ...TOTAL_KEYS]);
  const extras: ReconciliationExtra[] = Object.entries(report)
    .filter(([key, value]) => !known.has(key) && value !== null && typeof value !== "object")
    .map(([key, value]) => ({ label: humanizeKey(key.replace(/Minor$/, "")), value, money: isMoneyKey(key) }));

  return {
    created,
    skipped,
    totals: fileTotal !== null && importedTotal !== null ? { fileTotal, importedTotal } : null,
    extras,
  };
}
