import { formatDateTime } from "@/lib/format";
import type { Conflict, Timetable, TimetableState } from "./types";
import { severityOf } from "./conflict-marks";

/** API `state`, or derived from the older `status` when the field is missing. */
export function stateOf(timetable: Timetable | null | undefined): TimetableState {
  if (!timetable) return "EMPTY";
  if (timetable.state) return timetable.state;
  if (timetable.status === "PUBLISHED") return "PUBLISHED";
  if (timetable.status === "DRAFT_REVISION") return "PUBLISHED_WITH_CHANGES";
  if (timetable.status === "DRAFT" && timetable.slots.length > 0) return "DRAFT";
  return "EMPTY";
}

/** "Not published yet" / "Published · v3 · 8 Oct, 9:10 AM" / "Published v3 · unpublished changes". */
export function stateLabel(timetable: Timetable | null | undefined): string {
  const state = stateOf(timetable);
  const version = timetable?.version ?? 0;
  if (state === "PUBLISHED") {
    const when = timetable?.publishedAt ? ` · ${formatDateTime(timetable.publishedAt)}` : "";
    return `Published${version > 0 ? ` · v${version}` : ""}${when}`;
  }
  if (state === "PUBLISHED_WITH_CHANGES") return `Published${version > 0 ? ` v${version}` : ""} · unpublished changes`;
  return "Not published yet";
}

/** Why Publish is off, or null when it can go. Uses the API's reason when given. */
export function publishBlockedReason(timetable: Timetable | null, conflicts: Conflict[], mayPublish: boolean): string | null {
  if (!mayPublish) return "Ask the principal to publish";
  if (timetable?.canPublish === true) return null;
  if (timetable?.publishBlockedReason) return timetable.publishBlockedReason;
  const state = stateOf(timetable);
  if (state === "EMPTY") return "Add at least one lesson first";
  if (state === "PUBLISHED") return "No changes since the last publish";
  const errors = conflicts.filter((conflict) => severityOf(conflict) === "error").length;
  if (errors) return `Fix ${errors} conflict${errors === 1 ? "" : "s"} first`;
  return timetable?.canPublish === false ? "Nothing to publish" : null;
}
