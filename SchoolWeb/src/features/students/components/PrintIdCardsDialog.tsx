"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { OptionSelect } from "@/components/shared/OptionSelect";
import type { Option } from "@/components/shared/OptionSelect";
import { PdfJobStatus } from "@/components/shared/PdfJobStatus";
import { usePrintIdCardsForm } from "../use-print-id-cards";

interface PrintIdCardsDialogProps {
  branchId: string;
  sessionId: string;
  classes: Option[];
  classId?: string;
  onClose: () => void;
}

/** Prints current students' ID cards on A4 (10 per page with cut marks). */
export function PrintIdCardsDialog({ branchId, sessionId, classes, classId, onClose }: PrintIdCardsDialogProps) {
  const form = usePrintIdCardsForm(branchId, sessionId, classes, classId);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Print ID cards"
      description="Cards for every current student, ten per A4 page with cut marks. Students' own card versions are not changed."
      submitLabel="Generate PDF"
      submitting={form.pending}
      submitDisabled={form.loading}
      onSubmit={form.submit}
    >
      <OptionSelect label="Print for" options={form.options} value={form.target} onChange={form.setTarget} />
      <PdfJobStatus jobId={form.jobId} label="Preparing ID cards" downloadLabel="Download ID cards" unit="card" />
    </FormDialog>
  );
}
