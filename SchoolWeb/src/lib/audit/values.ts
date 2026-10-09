import { EMPTY_VALUE, formatMoney, humanize } from "../format";
import { formatTime } from "../time";

// Pure formatting of single audit snapshot values: labels, dates, times, enums.

const LABELS: Record<string, string> = {
  opensAt: "Opens at",
  closesAt: "Closes at",
  attendanceLockAt: "Attendance locks at",
  staffArrivesAt: "Teachers arrive",
  staffLeavesAt: "Teachers leave",
  workingDays: "Working days",
  schoolName: "School",
  principal: "Principal",
  dob: "Date of birth",
  dateOfBirth: "Date of birth",
  cnic: "CNIC",
  deviceName: "Device",
  platform: "Signed in from",
  isBreak: "Break",
  startTime: "Starts",
  endTime: "Ends",
  email: "Email",
  phone: "Phone",
  url: "Link",
  ip: "IP address",
};

/** Fields that never help a reader: identifiers, secrets and bookkeeping. */
const HIDDEN = new Set(["id", "createdAt", "updatedAt", "passwordHash", "tokenVersion", "endedFor", "version"]);

/** Codes kept exactly as typed (no enum humanising). */
const VERBATIM = new Set(["code", "email", "phone", "cnic", "rollNo", "admissionNo", "registrationNo", "employeeNo", "username", "ip"]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const ENUM = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Names and codes ("SMS", "MAIN") are shown as typed; only enum-like fields are humanised. */
function isVerbatim(key: string): boolean {
  return VERBATIM.has(key) || /(name|title|label|code|no)$/i.test(key);
}

export function isHiddenField(key: string): boolean {
  return HIDDEN.has(key) || /Ids?$/.test(key);
}

/** "attendanceLockAt" → "Attendance lock at"; known keys use friendlier labels. */
export function fieldLabel(key: string): string {
  if (LABELS[key]) return LABELS[key];
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Label for a flattened path like "timings.opensAt". */
export function pathLabel(path: string[]): string {
  const leaf = path[path.length - 1];
  if (path.length === 1 || LABELS[leaf]) return fieldLabel(leaf);
  return `${fieldLabel(path[path.length - 2])} – ${fieldLabel(leaf).toLowerCase()}`;
}

/** "8 Oct 2026" for a school-local date or an ISO timestamp. */
export function formatAuditDate(value: string): string {
  const match = DATE_ONLY.exec(value);
  const date = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(value);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

/** "8 Oct 2026, 12:02 PM". */
export function formatAuditDateTime(iso: string): string {
  return `${formatAuditDate(iso)}, ${formatClock(iso)}`;
}

/** "12:02 PM" from an ISO timestamp. */
export function formatClock(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));
}

/** "8:00–8:40 AM", or "11:20 AM – 12:00 PM" when the meridiem changes. */
export function formatCompactRange(from: string, to: string): string {
  const start = formatTime(from);
  const end = formatTime(to);
  if (start === EMPTY_VALUE || end === EMPTY_VALUE) return `${start} – ${end}`;
  const sameHalf = start.slice(-2) === end.slice(-2);
  return sameHalf ? `${start.slice(0, -3)}–${end}` : `${start} – ${end}`;
}

function formatString(key: string, value: string): string {
  if (!value.trim()) return EMPTY_VALUE;
  if (TIME.test(value)) return formatTime(value);
  if (DATE_ONLY.test(value)) return formatAuditDate(value);
  if (DATE_TIME.test(value) && !Number.isNaN(Date.parse(value))) return formatAuditDateTime(value);
  if (UUID.test(value)) return EMPTY_VALUE;
  if (!isVerbatim(key) && ENUM.test(value)) return humanize(value);
  return value;
}

/** [1,2,3,4,5,6] → "Mon – Sat"; [1,3,5] → "Mon, Wed, Fri"; runs of 3+ days collapse. */
export function formatWeekdays(days: number[]): string {
  const sorted = [...new Set(days)].filter((day) => day >= 0 && day <= 7).sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j += 1;
    if (j - i >= 2) parts.push(`${WEEKDAYS[sorted[i]]} – ${WEEKDAYS[sorted[j]]}`);
    else for (let k = i; k <= j; k += 1) parts.push(WEEKDAYS[sorted[k]]);
    i = j + 1;
  }
  return parts.join(", ") || EMPTY_VALUE;
}

/** One primitive (or named object) as plain text; arrays of objects are handled by lists.ts. */
export function formatAuditValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return EMPTY_VALUE;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return /Minor$/.test(key) ? formatMoney(value) : new Intl.NumberFormat("en-US").format(value);
  if (typeof value === "string") return formatString(key, value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    if (key === "workingDays" || key === "days") return formatWeekdays(value.map(Number));
    return value.map((item) => formatAuditValue(key, item)).filter((text) => text !== EMPTY_VALUE).join(", ") || EMPTY_VALUE;
  }
  if (typeof value === "object") {
    const named = value as Record<string, unknown>;
    const name = named.name ?? named.label ?? named.title;
    if (typeof name === "string") return name;
  }
  return EMPTY_VALUE;
}
