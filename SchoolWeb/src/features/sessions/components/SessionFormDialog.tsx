"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import type { AcademicSession } from "../types";
import { useSessionForm } from "../use-session-form";

interface SessionFormDialogProps {
  session: AcademicSession | null;
  branchId: string | null;
  onClose: () => void;
}

export function SessionFormDialog({ session, branchId, onClose }: SessionFormDialogProps) {
  const { form, submit, submitting, formError } = useSessionForm(session, branchId, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={session ? `Edit ${session.name}` : "New academic session"}
      description={session ? undefined : "New sessions start as drafts. Activate one when the year begins."}
      submitLabel={session ? "Save changes" : "Create session"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <TextField name="name" label="Name" required placeholder="2026-27" hint="Usually the academic year, e.g. 2026-27" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="startDate" label="Start date" type="date" required />
        <TextField name="endDate" label="End date" type="date" required />
      </div>
    </FormDialog>
  );
}
