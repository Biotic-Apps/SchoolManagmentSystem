export interface FieldChange {
  field: string;
  from: string;
  to: string;
}

type Snapshot = Record<string, unknown> | null | undefined;

const HIDDEN_FIELDS = new Set(["id", "createdAt", "updatedAt", "passwordHash", "tokenVersion"]);

function show(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** Field-level differences between an audit entry's before and after snapshots. */
export function auditChanges(before: Snapshot, after: Snapshot): FieldChange[] {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  return [...keys]
    .filter((key) => !HIDDEN_FIELDS.has(key))
    .map((key) => ({ field: key, from: show(before?.[key]), to: show(after?.[key]) }))
    .filter((change) => change.from !== change.to);
}
