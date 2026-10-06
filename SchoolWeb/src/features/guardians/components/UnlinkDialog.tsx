"use client";

import { ReasonDialog } from "@/components/shared/ReasonDialog";
import type { Unlink } from "../use-unlink";

/** Reason prompt for removing a guardian–student link; mounted only while a target is set. */
export function UnlinkDialog({ unlink }: { unlink: Unlink }) {
  const item = unlink.target.item;
  if (!item) return null;
  return (
    <ReasonDialog
      open
      onOpenChange={unlink.target.onOpenChange}
      title={`Remove ${item.guardianName} from ${item.studentName}?`}
      description="The link is revoked immediately; a parent account loses access to this child."
      submitLabel="Remove link"
      submitting={unlink.submitting}
      error={unlink.error}
      onSubmit={unlink.confirm}
    />
  );
}
