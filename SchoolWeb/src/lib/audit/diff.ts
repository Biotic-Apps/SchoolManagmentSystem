import { EMPTY_VALUE } from "../format";
import { isRecordList, listRows, nounFor, summariseList } from "./lists";
import { formatAuditValue, isHiddenField, pathLabel } from "./values";

// Turns an audit entry's before/after snapshots into readable "Field: old → new" rows.

export interface AuditChange {
  key: string;
  label: string;
  /** null when the record had no "before" (it was created). */
  from: string | null;
  /** null when the record has no "after" (it was removed). */
  to: string | null;
  /** Readable item rows for lists of records, shown behind "Show details". */
  details?: { before: string[]; after: string[] };
}

type Snapshot = unknown;
type Leaf = { path: string[]; value: unknown };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** A bare array snapshot (e.g. timetable.periods) is named after the action's last word. */
export function asRecord(snapshot: Snapshot, listKey: string): Record<string, unknown> {
  if (Array.isArray(snapshot)) return { [listKey]: snapshot };
  return isPlainObject(snapshot) ? snapshot : {};
}

/** Nested objects become labelled leaves; named objects ({ id, name }) stay whole. */
export function flatten(record: Record<string, unknown>, path: string[] = []): Map<string, Leaf> {
  const leaves = new Map<string, Leaf>();
  for (const [key, value] of Object.entries(record)) {
    if (isHiddenField(key)) continue;
    const next = [...path, key];
    if (isPlainObject(value) && !("name" in value)) {
      for (const [inner, leaf] of flatten(value, next)) leaves.set(inner, leaf);
    } else {
      leaves.set(next.join("."), { path: next, value });
    }
  }
  return leaves;
}

function isBlank(text: string | null): boolean {
  return text === null || text === EMPTY_VALUE || text === "None";
}

function describe(leaf: Leaf | undefined, present: boolean, noun: string, asList: boolean): string | null {
  if (!present) return null;
  const key = leaf?.path[leaf.path.length - 1] ?? "";
  return asList ? summariseList(leaf?.value, noun) : formatAuditValue(key, leaf?.value);
}

function toChange(key: string, before: Leaf | undefined, after: Leaf | undefined, hasBefore: boolean, hasAfter: boolean): AuditChange | null {
  if (JSON.stringify(before?.value ?? null) === JSON.stringify(after?.value ?? null)) return null;
  const path = (after ?? before)!.path;
  const asList = isRecordList(before?.value) || isRecordList(after?.value);
  const noun = nounFor(path[path.length - 1]);
  const from = describe(before, hasBefore, noun, asList);
  const to = describe(after, hasAfter, noun, asList);
  if (from === to) return null;
  // On create/remove, empty fields are noise.
  if ((from === null && isBlank(to)) || (to === null && isBlank(from))) return null;
  const change: AuditChange = { key, label: pathLabel(path), from, to };
  if (asList) change.details = { before: listRows(before?.value), after: listRows(after?.value) };
  return change;
}

/** Only the fields that changed, labelled and formatted for people. */
export function auditChanges(before: Snapshot, after: Snapshot, action = ""): AuditChange[] {
  const listKey = action.split(".").pop() || "items";
  const hasBefore = before !== null && before !== undefined;
  const hasAfter = after !== null && after !== undefined;
  const old = flatten(asRecord(before, listKey));
  const now = flatten(asRecord(after, listKey));
  const keys = [...new Set([...old.keys(), ...now.keys()])];
  return keys
    .map((key) => toChange(key, old.get(key), now.get(key), hasBefore, hasAfter))
    .filter((change): change is AuditChange => change !== null);
}
