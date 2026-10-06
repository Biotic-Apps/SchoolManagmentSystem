"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { FormSection } from "@/components/shared/FormSection";
import { TextField } from "@/components/shared/form/TextField";
import type { GradingScheme } from "../../types";
import { useGradingForm } from "../../use-grading-form";
import { BandTableEditor } from "./BandTableEditor";

interface GradingSchemeDialogProps {
  scheme: GradingScheme | null;
  schoolId: string;
  sessionId: string;
  onClose: () => void;
  onLocked: (id: string) => void;
}

export function GradingSchemeDialog({ scheme, schoolId, sessionId, onClose, onLocked }: GradingSchemeDialogProps) {
  const form = useGradingForm({ scheme, schoolId, sessionId, onDone: onClose, onLocked });

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={scheme ? "Edit grading scheme" : "New grading scheme"}
      description="Bands use whole percents and must cover 0 to 100% without gaps or overlaps."
      submitLabel={scheme ? "Save changes" : "Create scheme"}
      submitting={form.submitting}
      onSubmit={form.submit}
      form={form.form}
      error={form.formError}
      size="xl"
    >
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <TextField name="name" label="Name" required maxLength={80} />
        <TextField name="passPercent" label="Pass %" required inputMode="numeric" hint="Minimum percent to pass" />
      </div>
      <FormSection title="Grade bands" description="Highest band first, e.g. A+ 90–100, A 80–89.">
        <BandTableEditor
          rowIds={form.rows.map((row) => row.id)}
          coverage={form.coverage}
          onAdd={form.addBand}
          onRemove={form.removeBand}
        />
      </FormSection>
    </FormDialog>
  );
}
