// Line items inside a payload (purchase order lines, payroll lines, promotion rows).

export interface PayloadItem {
  key: string;
  label: string;
  quantity: number | null;
  amountMinor: number | null;
  note: string | null;
}

type Payload = Record<string, unknown>;

const LIST_KEYS = ["lines", "items", "rows", "students"];
const LABEL_KEYS = ["name", "itemName", "description", "staffName", "studentName", "title"];
const MONEY_KEYS = ["netMinor", "amountMinor", "totalMinor", "estimatedTotalMinor", "unitPriceMinor", "estimatedUnitMinor"];
const NOTE_KEYS = ["decision", "designation", "reason", "status"];

function isRecord(value: unknown): value is Payload {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function firstText(row: Payload, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value;
    if (isRecord(value) && typeof value.name === "string") return value.name;
  }
  return null;
}

function lineAmount(row: Payload): number | null {
  const key = MONEY_KEYS.find((name) => typeof row[name] === "number");
  if (!key) return null;
  const amount = row[key] as number;
  const quantity = typeof row.quantity === "number" ? row.quantity : null;
  return key.startsWith("unit") || key === "estimatedUnitMinor" ? amount * (quantity ?? 1) : amount;
}

/** The first list of records in the payload, as table rows; empty when there is none. */
export function payloadItems(payload: unknown): { title: string; items: PayloadItem[] } {
  if (!isRecord(payload)) return { title: "", items: [] };
  const key = LIST_KEYS.find((name) => Array.isArray(payload[name]));
  if (!key) return { title: "", items: [] };
  const rows = (payload[key] as unknown[]).filter(isRecord);
  const items = rows.map((row, index) => ({
    key: String(row.id ?? row.itemId ?? row.staffId ?? row.studentId ?? index),
    label: firstText(row, LABEL_KEYS) ?? `Line ${index + 1}`,
    quantity: typeof row.quantity === "number" ? row.quantity : null,
    amountMinor: lineAmount(row),
    note: firstText(row, NOTE_KEYS),
  }));
  return { title: key.charAt(0).toUpperCase() + key.slice(1), items };
}
