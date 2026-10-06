"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { DECISION_OPTIONS } from "../options";
import type { Application } from "../types";
import { useDecideForm } from "../use-application-action-forms";

export function DecideDialog({ app, onClose }: { app: Application; onClose: () => void }) {
  const { form, submit, submitting, formError, reasonRequired, waitlisting } = useDecideForm(app, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Decide application ${app.applicationNo}`}
      description="The primary guardian is notified of the decision."
      submitLabel="Save decision"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <SelectField
        name="decision"
        label="Decision"
        options={DECISION_OPTIONS}
        required
        hint={waitlisting ? "The application joins the end of this class's waiting list." : undefined}
      />
      <TextareaField
        name="reason"
        label="Reason"
        required={reasonRequired}
        hint={reasonRequired ? "Shared with the guardian." : "Optional."}
        rows={3}
      />
    </FormDialog>
  );
}
