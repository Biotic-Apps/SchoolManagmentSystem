import type { Option } from "@/components/shared/OptionSelect";
import type { StepperStep } from "@/components/shared/StatusStepper";
import type { BadgeTone } from "@/components/ui/Badge";
import { toIsoDate } from "@/lib/dates";
import { formatDate, formatMoney } from "@/lib/format";
import { formatTime, pad } from "@/lib/time";
import type { Activity, ActivityAudience, ActivityStatus, ActivityType } from "./types";

export const ACTIVITY_TYPE_OPTIONS: { id: ActivityType; name: string }[] = [
  { id: "EVENT", name: "Event" },
  { id: "SPORTS", name: "Sports" },
  { id: "TRIP", name: "Trip" },
  { id: "COMPETITION", name: "Competition" },
  { id: "CLUB", name: "Club" },
];

export const ACTIVITY_STATUS_OPTIONS: Option[] = [
  { id: "PROPOSED", name: "Proposed" },
  { id: "ANNOUNCED", name: "Announced" },
  { id: "ONGOING", name: "Ongoing" },
  { id: "COMPLETED", name: "Completed" },
  { id: "REJECTED", name: "Rejected" },
  { id: "CANCELLED", name: "Cancelled" },
];

const TYPE_TONE: Record<ActivityType, BadgeTone> = {
  EVENT: "primary",
  SPORTS: "success",
  TRIP: "info",
  COMPETITION: "warning",
  CLUB: "neutral",
};

export const typeTone = (type: ActivityType): BadgeTone => TYPE_TONE[type] ?? "neutral";
export const typeLabel = (type: ActivityType) => ACTIVITY_TYPE_OPTIONS.find((item) => item.id === type)?.name ?? type;

export const ACTIVITY_STEPS: StepperStep[] = [
  { id: "PROPOSED", label: "Proposed" },
  { id: "ANNOUNCED", label: "Announced" },
  { id: "ONGOING", label: "Ongoing" },
  { id: "COMPLETED", label: "Completed" },
];

/** APPROVED is a pass-through to ANNOUNCED; REJECTED fails at proposal, CANCELLED after announcement. */
export function activityStepper(status: ActivityStatus): { current: string; failedLabel: string | null } {
  if (status === "REJECTED") return { current: "PROPOSED", failedLabel: "Rejected" };
  if (status === "CANCELLED") return { current: "ANNOUNCED", failedLabel: "Cancelled" };
  if (status === "APPROVED") return { current: "ANNOUNCED", failedLabel: null };
  return { current: status, failedLabel: null };
}

/** Local "YYYY-MM-DD" and 24h "HH:mm" parts of an ISO instant. */
export function localParts(iso: string): { date: string; time: string } {
  const value = new Date(iso);
  return { date: toIsoDate(value), time: `${pad(value.getHours())}:${pad(value.getMinutes())}` };
}

/** "12 Oct 2026 · 9:00 AM – 1:00 PM", or both ends in full when it spans days. */
export function formatActivityWhen(startAt: string, endAt: string): string {
  const start = localParts(startAt);
  const end = localParts(endAt);
  if (start.date === end.date) return `${formatDate(start.date)} · ${formatTime(start.time)} – ${formatTime(end.time)}`;
  return `${formatDate(start.date)}, ${formatTime(start.time)} – ${formatDate(end.date)}, ${formatTime(end.time)}`;
}

export function formatFee(feeMinor: number | null): string {
  return feeMinor ? formatMoney(feeMinor) : "Free";
}

export function activityAudienceSummary(audience: ActivityAudience, nameOf?: (id: string) => string | undefined): string {
  if (audience.wholeBranch) return "Whole branch";
  const label = (ids: string[] | undefined, noun: string, plural: string) => {
    if (!ids?.length) return null;
    const names = nameOf ? ids.map(nameOf).filter(Boolean) : [];
    if (names.length === ids.length && names.length <= 3) return names.join(", ");
    return `${ids.length} ${ids.length === 1 ? noun : plural}`;
  };
  return (
    [label(audience.classIds, "class", "classes"), label(audience.sectionIds, "section", "sections")]
      .filter(Boolean)
      .join(" · ") || "No audience"
  );
}

/** The consent deadline is a school-local date; responses close at the end of it. */
export function consentOpen(activity: Activity, today: string): boolean {
  if (!activity.consentRequired) return false;
  if (activity.status !== "ANNOUNCED" && activity.status !== "APPROVED") return false;
  return !activity.consentDeadline || activity.consentDeadline.slice(0, 10) >= today;
}
