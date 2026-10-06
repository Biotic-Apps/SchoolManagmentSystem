import { toast } from "@/lib/toast";
import { hasErrorCode } from "@/lib/api-error";
import { errorMessage } from "@/lib/error-messages";
import type { DiaryEntry, DiaryStatus } from "./types";

export const SUPERVISOR_ROLES = ["PRINCIPAL", "COORDINATOR", "HEAD_TEACHER", "SUPER_ADMIN"];

/** Statuses the author can still change (PUBLISHED until the closing time, then 423). */
export const EDITABLE_STATUSES: DiaryStatus[] = ["DRAFT", "RETURNED", "PUBLISHED"];
export const PUBLISHABLE_STATUSES: DiaryStatus[] = ["DRAFT", "RETURNED"];

export interface DiaryDay {
  date: string;
  entries: DiaryEntry[];
}

/** Entries grouped by date, newest day first, subjects A–Z within a day. */
export function groupByDate(entries: DiaryEntry[]): DiaryDay[] {
  const days = new Map<string, DiaryEntry[]>();
  for (const entry of entries) days.set(entry.date, [...(days.get(entry.date) ?? []), entry]);
  return [...days.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, list]) => ({ date, entries: list.sort((x, y) => x.subject.name.localeCompare(y.subject.name)) }));
}

export function notifyPublishResult(result: { status?: string } | null | undefined) {
  if (result?.status === "SUBMITTED") toast.info("Sent for moderation");
  else if (result?.status === "PENDING_REVIEW") toast.info("Sent for review — it applies once your reviewer approves it");
  else toast.success("Diary published");
}

/** 423 after the branch's diary closing time. */
export function toastDiaryError(error: unknown) {
  toast.error(hasErrorCode(error, "RECORD_LOCKED") ? "Diary closed for today" : errorMessage(error));
}
