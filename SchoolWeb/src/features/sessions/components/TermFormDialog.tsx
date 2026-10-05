"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import { formatDateRange } from "@/lib/format";
import type { AcademicSession, Term } from "../types";
import { useTermForm } from "../use-term-form";

interface TermFormDialogProps {
  session: AcademicSession;
  term: Term | null;
  terms: Term[];
  onClose: () => void;
}

export function TermFormDialog({ session, term, terms, onClose }: TermFormDialogProps) {
  const { form, submit, submitting, formError } = useTermForm(session, term, terms, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={term ? `Edit ${term.name}` : "Add term"}
      description={`${session.name}: ${formatDateRange(session.startDate, session.endDate)}`}
      submitLabel={term ? "Save changes" : "Add term"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <TextField name="name" label="Name" required placeholder="Term 1" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="startDate"
          label="Start date"
          type="date"
          required
          min={session.startDate}
          max={session.endDate}
        />
        <TextField name="endDate" label="End date" type="date" required min={session.startDate} max={session.endDate} />
      </div>
    </FormDialog>
  );
}
