import { formatDate, humanize } from "@/lib/format";
import { formatPeriod, isPeriod } from "@/lib/period";

export interface PayloadLine {
  label: string;
  value: string;
  /** Set for money keys (`*Minor`); rendered with MoneyText. */
  amountMinor?: number;
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
  // Phase 3: health-record change requests (CONTACT_CHANGE on HEALTH).
  bloodGroup: "Blood group",
  emergencyContacts: "Emergency contacts",
  doctor: "Doctor",
  // Phase 4: finance and results.
  examName: "Exam",
  invoiceNo: "Invoice",
  receiptNo: "Receipt",
  feeHeadName: "Fee head",
  staffName: "Staff",
  vendorName: "Vendor",
  categoryName: "Category",
  certificateType: "Certificate",
  effectiveDate: "Effective date",
  month: "Month",
  period: "Period",
  from: "From",
  to: "To",
  reason: "Reason",
  method: "Method",
  lineCount: "Lines",
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
  if (typeof value === "string") {
    if (isPeriod(value)) return formatPeriod(value);
    return ISO_DATE.test(value) ? formatDate(value.slice(0, 10)) : humanizeCode(value);
  }
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (isRecord(value) && typeof value.name === "string") return value.name;
  return null;
}

function humanizeCode(value: string): string {
  return /^[A-Z][A-Z0-9_]+$/.test(value) ? humanize(value) : value;
}

const MONEY_KEY = /Minor$/;

function labelFor(key: string, prefix: string): string {
  const name = key.replace(MONEY_KEY, "") || key;
  const base = LABELS[name] ?? humanize(name.replace(/([a-z])([A-Z])/g, "$1_$2"));
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
    if (MONEY_KEY.test(key) && typeof value === "number") return [{ label: labelFor(key, prefix), value: "", amountMinor: value }];
    const shown = show(value);
    if (shown !== null) return [{ label: labelFor(key, prefix), value: shown }];
    return isRecord(value) && !prefix ? flatten(value, humanize(key)) : [];
  });
}

// CONCESSION: `value` is a percent for PERCENT and a minor amount for FIXED.
function concessionLines(payload: Payload): PayloadLine[] {
  const lines = flatten(payload).filter((line) => line.label !== "Value");
  const value = payload.value;
  if (typeof value !== "number") return lines;
  const line: PayloadLine =
    payload.type === "FIXED" ? { label: "Concession", value: "", amountMinor: value } : { label: "Concession", value: `${value}%` };
  return [line, ...lines];
}

/** Human-readable lines for an approval's payload (CHILD_LINK, CONTACT_CHANGE, CONCESSION, PAYROLL, ...). */
export function payloadSummary(type: string, payload: unknown): PayloadLine[] {
  if (!isRecord(payload)) return [];
  if (type === "CONTACT_CHANGE") return changeLines(payload) ?? flatten(payload);
  if (type === "CONCESSION") return concessionLines(payload);
  return flatten(payload);
}
