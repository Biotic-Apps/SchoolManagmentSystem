import { toast } from "./toast";

/** Probation-gated (P) actions answer `{ status: "PENDING_REVIEW", approvalId }` instead of applying. */
export function isHeldForReview(result: unknown): boolean {
  return !!result && typeof result === "object" && (result as { status?: unknown }).status === "PENDING_REVIEW";
}

export function notifyActionResult(result: unknown, success: string) {
  if (isHeldForReview(result)) toast.info("Sent for review — it applies once your reviewer approves it");
  else toast.success(success);
}
