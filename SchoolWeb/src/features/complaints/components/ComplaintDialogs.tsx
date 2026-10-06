"use client";

import { ReasonDialog } from "@/components/shared/ReasonDialog";
import type { ComplaintAction } from "../api";
import type { Complaint } from "../types";
import type { ComplaintDetail } from "../use-complaint-detail";
import { AssignDialog } from "./AssignDialog";
import { ComplaintUpdateDialog } from "./ComplaintUpdateDialog";

const REASON_COPY: Record<ComplaintAction, { title: string; description: string; submit: string; required: boolean }> = {
  escalate: {
    title: "Escalate complaint",
    description: "It moves to the next level (principal, then super admin).",
    submit: "Escalate",
    required: true,
  },
  close: {
    title: "Close complaint",
    description: "Closed complaints can no longer be updated.",
    submit: "Close complaint",
    required: false,
  },
  reopen: {
    title: "Reopen complaint",
    description: "Tell the school why the issue isn't resolved. Possible within 7 days of resolution.",
    submit: "Reopen",
    required: true,
  },
};

/** The one action dialog open over the complaint drawer. */
export function ComplaintDialogs({ detail, complaint }: { detail: ComplaintDetail; complaint: Complaint }) {
  const { dialog } = detail;
  if (dialog === "assign") return <AssignDialog complaint={complaint} onClose={detail.closeDialog} />;
  if (dialog === "update") {
    return (
      <ComplaintUpdateDialog
        complaintId={complaint.id}
        canSetStatus={detail.rights.setStatus}
        onClose={detail.closeDialog}
      />
    );
  }
  if (!dialog) return null;
  const copy = REASON_COPY[dialog];
  return (
    <ReasonDialog
      open
      onOpenChange={(open) => !open && detail.closeDialog()}
      title={copy.title}
      description={copy.description}
      label={copy.required ? "Reason" : "Note (optional)"}
      required={copy.required}
      submitLabel={copy.submit}
      submitting={detail.acting}
      error={detail.actionError}
      onSubmit={(reason) => detail.runAction(dialog, reason)}
    />
  );
}
