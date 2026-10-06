import type { DataTableColumn } from "@/components/shared/DataTable";
import { EMPTY_VALUE, formatMoney, formatNumber, humanize } from "@/lib/format";
import type { ImportPreviewRow } from "./import-types";

/** "admissionNo" / "admission_no" → "Admission no". */
export function humanizeKey(key: string): string {
  return humanize(key.replace(/([a-z0-9])([A-Z])/g, "$1_$2"));
}

export function isMoneyKey(key: string): boolean {
  return /Minor$/.test(key) || /_minor$/i.test(key);
}

function formatCell(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE;
  if (typeof value === "number") return isMoneyKey(key) ? formatMoney(value) : formatNumber(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export type KeyedPreviewRow = { key: string; values: ImportPreviewRow };

/** Columns from the union of keys of the parsed rows, in first-seen order. */
export function previewColumns(rows: ImportPreviewRow[]): DataTableColumn<KeyedPreviewRow>[] {
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return keys.map((key) => {
    const numeric = rows.every((row) => row[key] === null || row[key] === undefined || typeof row[key] === "number");
    return {
      id: key,
      header: humanizeKey(key),
      className: numeric ? "whitespace-nowrap text-right tabular-nums" : "whitespace-nowrap",
      cell: (row) => formatCell(key, row.values[key]),
    };
  });
}
