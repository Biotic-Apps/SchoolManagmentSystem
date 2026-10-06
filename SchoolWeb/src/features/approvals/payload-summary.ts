import { formatDate, humanize } from "@/lib/format";

export interface PayloadLine {
  label: string;
  value: string;
}

type Payload = Record<string, unknown>;

// Readable names for the keys the Phase 2 approval types carry.
const LABELS: Record<string, string> = {
  guardianName: "Guardian",
  studentName: "Student",
  admissionNo: "Admission no.",
  relation: "Relation",
  phone: "Phone",
  email: "Email",
  address: "Address",
  subjectName: "Subject",
  sectionName: "Section",
  className: "Class",
  revision: "Revision",
  action: "Action",
  status: "New status",
  completedOn: "Completed on",
  note: "Note",
  topicTitle: "Topic",
  onBehalfOf: "On behalf of",
};

// Keys whose old/new pair is shown as a change (CONTACT_CHANGE).
const OLD_KEYS = ["old", "previous", "current", "before"];
const NEW_KEYS = ["new", "requested", "next", "after", "changes"];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T|$)/;

function isRecord(value: unknown): value is Payload {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function show(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return ISO_DATE.test(value) ? formatDate(value.slice(0, 10)) : humanizeCode(value);
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (isRecord(value) && typeof value.name === "string") return value.name;
  return null;
}

function humanizeCode(value: string): string {
  return /^[A-Z][A-Z0-9_]+$/.test(value) ? humanize(value) : value;
}

function labelFor(key: string, prefix: string): string {
  const base = LABELS[key] ?? humanize(key.replace(/([a-z])([A-Z])/g, "$1_$2"));
  return prefix ? `${prefix} ${base.toLowerCase()}` : base;
}

function pick(payload: Payload, keys: string[]): Payload | null {
  const key = keys.find((name) => isRecord(payload[name]));
  return key ? (payload[key] as Payload) : null;
}

function changeLines(payload: Payload): PayloadLine[] | null {
  const before = pick(payload, OLD_KEYS);
  const after = pick(payload, NEW_KEYS);
  if (!after) return null;
  return Object.keys(after)
    .map((key) => ({ key, from: show(before?.[key]), to: show(after[key]) }))
    .filter((change) => change.to !== null)
    .map((change) => ({ label: labelFor(change.key, ""), value: `${change.from ?? "—"} → ${change.to}` }));
}

function flatten(payload: Payload, prefix = ""): PayloadLine[] {
  return Object.entries(payload).flatMap(([key, value]) => {
    if (/id$/i.test(key) || key === "id") return [];
    const shown = show(value);
    if (shown !== null) return [{ label: labelFor(key, prefix), value: shown }];
    return isRecord(value) && !prefix ? flatten(value, humanize(key)) : [];
  });
}

/** Human-readable lines for an approval's payload (CHILD_LINK, CONTACT_CHANGE, SYLLABUS_PLAN, PROBATION_REVIEW, ...). */
export function payloadSummary(type: string, payload: unknown): PayloadLine[] {
  if (!isRecord(payload)) return [];
  if (type === "CONTACT_CHANGE") return changeLines(payload) ?? flatten(payload);
  return flatten(payload);
}
