"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { useCan } from "@/features/auth/use-can";
import { useSchoolOptions } from "@/features/schools/api";
import type { Role } from "../types";
import { useRoleForm } from "../use-role-form";
import { PermissionMatrix } from "./PermissionMatrix";

interface RoleFormDialogProps {
  role: Role | null;
  onClose: () => void;
}

export function RoleFormDialog({ role, onClose }: RoleFormDialogProps) {
  const { form, submit, submitting, formError, rights, readOnly, keyHint, notice } = useRoleForm(role, onClose);
  const can = useCan();
  const showSchool = !role && can("schools.view");
  const schools = useSchoolOptions(showSchool);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={role ? (readOnly ? role.name : `Edit ${role.name}`) : "Create custom role"}
      description={role?.isSystem ? "System role" : undefined}
      submitLabel={readOnly ? "Done" : role ? "Save changes" : "Create role"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="xl"
    >
      {notice && <InlineNotice>{notice}</InlineNotice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="Role name" required readOnly={!rights.name} hint={keyHint} />
        {showSchool && (
          <SelectField
            name="schoolId"
            label="School"
            options={schools.options}
            emptyLabel="All schools (global)"
            hint="Limit this role to one school, or leave it global."
          />
        )}
      </div>
      <PermissionMatrix readOnly={!rights.permissions} />
    </FormDialog>
  );
}
