"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import type { Branch } from "../types";
import { useBranchTimingsForm } from "../use-branch-timings-form";
import { BranchTimingsFields } from "./BranchTimingsFields";

/** Edits school hours, teacher hours, attendance lock and working days of one branch. */
export function BranchTimingsDialog({ branch, onClose }: { branch: Branch; onClose: () => void }) {
  const { form, submit, submitting, formError } = useBranchTimingsForm(branch, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Edit timings — ${branch.name}`}
      description="Teachers see their arrive/leave times; attendance locks at the set time each working day."
      submitLabel="Save timings"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <BranchTimingsFields />
    </FormDialog>
  );
}
