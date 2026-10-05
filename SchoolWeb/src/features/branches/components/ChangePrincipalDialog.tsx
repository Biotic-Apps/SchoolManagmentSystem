"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SelectField } from "@/components/shared/form/SelectField";
import { useUserOptions } from "@/features/users/api";
import type { Branch } from "../types";
import { useChangePrincipalForm } from "../use-change-principal-form";

export function ChangePrincipalDialog({ branch, onClose }: { branch: Branch; onClose: () => void }) {
  const { form, submit, submitting, formError } = useChangePrincipalForm(branch, onClose);
  const principals = useUserOptions("PRINCIPAL");

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Change principal — ${branch.name}`}
      submitLabel="Change principal"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <InlineNotice tone="warning">
        The current principal&apos;s assignment ends now, their sessions for this role are signed out and their pending
        approvals move to the new principal.
      </InlineNotice>
      <SelectField
        name="userId"
        label="New principal"
        options={principals.options}
        placeholder={principals.isLoading ? "Loading…" : "Select a user"}
        hint="Only active users holding the Principal role are listed. Create the account first in Principals & Admin Users."
        required
      />
    </FormDialog>
  );
}
