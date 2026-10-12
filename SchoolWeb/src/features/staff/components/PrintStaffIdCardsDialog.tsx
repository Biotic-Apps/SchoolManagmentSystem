"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { PdfJobStatus } from "@/components/shared/PdfJobStatus";
import { usePrintStaffIdCardsForm } from "../use-print-staff-id-cards";

interface PrintStaffIdCardsDialogProps {
  branchId: string;
  onClose: () => void;
}

export function PrintStaffIdCardsDialog({ branchId, onClose }: PrintStaffIdCardsDialogProps) {
  const form = usePrintStaffIdCardsForm(branchId);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Print staff ID cards"
      description="ID cards for all active staff in the branch, ten per A4 page with cut marks."
      submitLabel="Generate PDF"
      submitting={form.pending}
      onSubmit={form.submit}
    >
      <OptionSelect
        label="Designation"
        options={form.designationOptions}
        value={form.designation ?? ""}
        onChange={form.setDesignation}
      />
      <PdfJobStatus jobId={form.jobId} label="Preparing staff ID cards" downloadLabel="Download staff ID cards" unit="card" />
    </FormDialog>
  );
}
