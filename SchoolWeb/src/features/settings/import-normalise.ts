import type { ImportDetail, ImportSummary, ImportTotals } from "./import-types";

type Raw = Record<string, unknown>;

function num(value: unknown): number {
  return typeof value === "number" ? value : Number(value) || 0;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function totalsFrom(raw: Raw): ImportTotals | null {
  const source = (raw.totals as Raw | undefined) ?? raw;
  if (source.rows === undefined && source.valid === undefined && source.invalid === undefined) return null;
  return { rows: num(source.rows), valid: num(source.valid), invalid: num(source.invalid) };
}

function personName(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  const person = value as Raw;
  return str(person.name) ?? str(person.fullName) ?? str(person.email);
}

export function normaliseDetail(raw: Raw): ImportDetail {
  return {
    ...(raw as unknown as ImportDetail),
    totals: totalsFrom(raw) ?? { rows: 0, valid: 0, invalid: 0 },
    errors: Array.isArray(raw.errors) ? (raw.errors as ImportDetail["errors"]) : [],
    preview: Array.isArray(raw.preview) ? (raw.preview as ImportDetail["preview"]) : [],
  };
}

function normaliseSummary(raw: Raw): ImportSummary {
  return {
    id: String(raw.id ?? raw.importId ?? ""),
    kind: String(raw.kind ?? ""),
    status: String(raw.status ?? ""),
    fileName: str(raw.fileName) ?? str(raw.originalName) ?? str(raw.filename),
    totals: totalsFrom(raw),
    startedAt: str(raw.startedAt) ?? str(raw.createdAt),
    startedBy: personName(raw.startedBy ?? raw.createdBy ?? raw.createdByName ?? raw.user),
  };
}

/** History may come as a plain array or a page object ({ items } / { data }). */
export function normaliseHistory(data: unknown): ImportSummary[] {
  const list = Array.isArray(data)
    ? data
    : ((data as Raw | null)?.items ?? (data as Raw | null)?.data ?? []);
  return Array.isArray(list) ? (list as Raw[]).map(normaliseSummary).filter((item) => item.id) : [];
}
