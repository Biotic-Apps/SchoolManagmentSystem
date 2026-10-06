"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { SelectField } from "@/components/shared/form/SelectField";
import { Label } from "@/components/ui/Label";
import type { Complaint } from "../types";
import { useAssignForm } from "../use-assign-form";

export function AssignDialog({ complaint, onClose }: { complaint: Complaint; onClose: () => void }) {
  const assign = useAssignForm(complaint, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Assign ${complaint.ticketNo}`}
      description="The assignee is notified and becomes responsible for resolving it."
      submitLabel="Assign"
      submitting={assign.submitting}
      onSubmit={assign.submit}
      form={assign.form}
      error={assign.formError}
    >
      {assign.branch.showPicker && (
        <div className="flex flex-col gap-1.5">
          <Label>Branch</Label>
          <OptionSelect
            label="Branch"
            options={assign.branch.options}
            value={assign.branch.branchId}
            onChange={assign.branch.setBranchId}
          />
        </div>
      )}
      <SelectField
        name="assigneeUserId"
        label="Assign to"
        options={assign.options}
        placeholder={assign.loading ? "Loading staff…" : "Choose staff"}
        required
      />
    </FormDialog>
  );
}
