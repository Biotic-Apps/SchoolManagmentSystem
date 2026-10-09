import { EMPTY_VALUE } from "../format";
import { formatTime, formatTimeRange } from "../time";
import { asRecord, flatten, type AuditChange } from "./diff";
import { isRecordList, listRows, nounFor, summariseList } from "./lists";
import { formatAuditValue, pathLabel } from "./values";

// Created/deleted records: one summary sentence plus a few readable facts, never "— →" diffs.

type Row = Record<string, unknown>;

/** Fields that go into the sentence itself, so they are not repeated as facts. */
const IN_SENTENCE = new Set(["name", "title", "fullName", "label", "code", "schoolName"]);

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** "Created Main Branch (MAIN) for SMS" / "Deleted the fee plan". */
export function recordSentence(verb: "Created" | "Deleted", entity: string, row: Row): string {
  const name = text(row.name) ?? text(row.title) ?? text(row.fullName) ?? text(row.label);
  const code = text(row.code);
  const parent = entity !== "school" ? text(row.schoolName) : null;
  const subject = name ? `${name}${code && code !== name ? ` (${code})` : ""}` : `the ${entity}`;
  return `${verb} ${subject}${parent ? ` for ${parent}` : ""}`;
}

function timingsFact(row: Row): AuditChange | null {
  const timings = row.timings as Row | null | undefined;
  if (!timings || typeof timings.opensAt !== "string" || typeof timings.closesAt !== "string") return null;
  const lock = typeof timings.attendanceLockAt === "string" ? ` · attendance closes ${formatTime(timings.attendanceLockAt)}` : "";
  const staff =
    typeof timings.staffArrivesAt === "string" && typeof timings.staffLeavesAt === "string"
      ? ` · teachers ${formatTimeRange(timings.staffArrivesAt, timings.staffLeavesAt)}`
      : "";
  return { key: "timings", label: "Timings", from: null, to: `${formatTimeRange(timings.opensAt, timings.closesAt)}${lock}${staff}` };
}

/** Readable facts about a record snapshot: blanks, ids, defaults and sentence fields are left out. */
export function recordFacts(snapshot: unknown, listKey = "items"): AuditChange[] {
  const row = asRecord(snapshot, listKey);
  const facts: AuditChange[] = [];
  const timings = timingsFact(row);
  if (timings) facts.push(timings);
  for (const [key, leaf] of flatten(row)) {
    const top = leaf.path[0];
    if (IN_SENTENCE.has(top) || (timings && top === "timings")) continue;
    if (top === "status" && leaf.value === "ACTIVE") continue;
    const leafKey = leaf.path[leaf.path.length - 1];
    const asList = isRecordList(leaf.value);
    const value = asList ? summariseList(leaf.value, nounFor(leafKey)) : formatAuditValue(leafKey, leaf.value);
    if (value === EMPTY_VALUE || value === "None") continue;
    const fact: AuditChange = { key, label: pathLabel(leaf.path), from: null, to: value };
    if (asList) fact.details = { before: [], after: listRows(leaf.value) };
    facts.push(fact);
  }
  return facts;
}
