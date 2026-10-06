import { isHeldForReview } from "@/lib/probation";
import { toast } from "@/lib/toast";
import type { SendResult } from "./types";

export const SILENT_DELIVERY_TEXT = "Delivered silently — outside office hours, they'll be notified later";

/** Toast for a sent message: held for review (probation), silent (after hours) or sent. */
export function notifySendResult(result: SendResult | null | undefined, sent = "Message sent") {
  if (isHeldForReview(result)) toast.info("Sent for review — it's delivered once your reviewer approves it");
  else if (result?.deliveredSilently) toast.info(SILENT_DELIVERY_TEXT);
  else toast.success(sent);
}
