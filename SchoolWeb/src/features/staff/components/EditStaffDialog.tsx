"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import type { StaffDetail } from "../types";
import { useEditStaffForm } from "../use-edit-staff-form";
import { StaffProfileFields } from "./StaffProfileFields";

export function EditStaffDialog({ staff, onClose }: { staff: StaffDetail; onClose: () => void }) {
  const { form, submit, submitting, formError } = useEditStaffForm(staff, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Edit ${staff.name}`}
      submitLabel="Save changes"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <StaffProfileFields
        photoUrl={staff.photoUrl}
        cnicHint={staff.cnic ? `On file: ${staff.cnic}. Leave blank to keep it.` : undefined}
      />
    </FormDialog>
  );
}
