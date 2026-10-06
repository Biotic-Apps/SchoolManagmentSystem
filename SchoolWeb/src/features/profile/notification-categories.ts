import type { NotificationCategory } from "./types";

export const NOTIFICATION_CATEGORIES: { id: NotificationCategory; label: string; hint: string }[] = [
  { id: "ATTENDANCE", label: "Attendance", hint: "Absences, late arrivals and registers" },
  { id: "DIARY", label: "Diary", hint: "Daily diary and homework" },
  { id: "ACTIVITY", label: "Activity", hint: "Events, trips and results" },
  { id: "CONSENT", label: "Consent", hint: "Permission slips waiting for you" },
  { id: "NOTICE", label: "Notice", hint: "School announcements" },
  { id: "MESSAGE", label: "Message", hint: "New messages" },
  { id: "COMPLAINT", label: "Complaint", hint: "Updates on complaints" },
  { id: "MEETING", label: "Meeting", hint: "Bookings and reminders" },
  { id: "HEALTH", label: "Health", hint: "Incidents and medical alerts" },
  { id: "PICKUP", label: "Pickup", hint: "Departures and blocked pickups" },
  { id: "LEAVE", label: "Leave", hint: "Leave and early-leave decisions" },
  { id: "APPROVAL", label: "Approval", hint: "Requests waiting for your decision" },
];

/** Safety alerts can't be muted. */
export const LOCKED_CATEGORIES: ReadonlySet<NotificationCategory> = new Set(["HEALTH", "PICKUP"]);
