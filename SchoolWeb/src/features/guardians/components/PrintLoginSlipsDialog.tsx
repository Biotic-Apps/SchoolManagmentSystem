"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { OptionSelect } from "@/components/shared/OptionSelect";
import type { Option } from "@/components/shared/OptionSelect";
import { PdfJobStatus } from "@/components/shared/PdfJobStatus";
import { usePrintLoginSlipsForm } from "../use-print-login-slips";
import { LoginSlipReview } from "./LoginSlipReview";

interface PrintLoginSlipsDialogProps {
  branchId: string;
  sessionId: string;
  classes: Option[];
  classId?: string;
  onClose: () => void;
}

/** Branded parent login slips for a class or section (three per A4 page, with QR codes). */
export function PrintLoginSlipsDialog({ branchId, sessionId, classes, classId, onClose }: PrintLoginSlipsDialogProps) {
  const form = usePrintLoginSlipsForm(branchId, sessionId, classes, classId);
  const changes = form.review ? form.review.create + form.review.reset : 0;

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Print parent login slips"
      description="One slip per student for the primary guardian: username, temporary password, sign-in address and a QR code. You review the changes first."
      submitLabel={!form.review ? "Review" : changes > 0 ? "Set passwords and print" : "Print slips"}
      submitting={form.pending}
      submitDisabled={form.loading || (!!form.review && form.review.slips === 0)}
      onSubmit={form.submit}
    >
      <OptionSelect label="Print for" options={form.options} value={form.target} onChange={form.setTarget} />
      {form.review && <LoginSlipReview review={form.review} />}
      <PdfJobStatus jobId={form.jobId} label="Preparing login slips" downloadLabel="Download login slips" unit="slip" />
    </FormDialog>
  );
}
