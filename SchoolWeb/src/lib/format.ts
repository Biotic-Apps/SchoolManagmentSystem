export const EMPTY_VALUE = "—";

const LOCALE = "en-PK";

export function formatMoney(amountMinor: number, currency = "PKR"): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_VALUE;
  return new Intl.NumberFormat(LOCALE).format(value);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return EMPTY_VALUE;
  return new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "short", year: "numeric" }).format(
    toDate(iso),
  );
}

// "YYYY-MM-DD" is a school-local date, not UTC midnight.
function toDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(value);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return EMPTY_VALUE;
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export function formatDateRange(start: string, end: string): string {
  return start === end ? formatDate(start) : `${formatDate(start)} – ${formatDate(end)}`;
}

export function textOrDash(value: string | null | undefined): string {
  return value && value.trim() ? value : EMPTY_VALUE;
}

export function humanize(code: string): string {
  const text = code.replace(/[_-]+/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
