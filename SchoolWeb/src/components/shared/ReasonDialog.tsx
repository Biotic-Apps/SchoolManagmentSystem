"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { FormDialog } from "./FormDialog";
import { FormField } from "./FormField";

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label?: string;
  submitLabel?: string;
  /** false for an optional note (e.g. a verification note). */
  required?: boolean;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (reason: string) => void;
  /** Extra controls shown above the reason. */
  children?: ReactNode;
}

/** Small form for actions that need a written reason (reject, withdraw, cancel, unlink). */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  label = "Reason",
  submitLabel = "Confirm",
  required = true,
  submitting,
  error,
  onSubmit,
  children,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [missing, setMissing] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = reason.trim();
    setMissing(required && !text);
    if (required && !text) return;
    onSubmit(text);
  };

  const changeOpen = (next: boolean) => {
    if (!next) {
      setReason("");
      setMissing(false);
    }
    onOpenChange(next);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={changeOpen}
      title={title}
      description={description}
      submitLabel={submitLabel}
      submitting={submitting}
      onSubmit={submit}
      error={error}
    >
      {children}
      <FormField
        id="reason-dialog-text"
        label={label}
        required={required}
        error={missing ? { type: "required", message: `Enter the ${label.toLowerCase()}` } : undefined}
      >
        <Textarea
          id="reason-dialog-text"
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          aria-invalid={missing}
        />
      </FormField>
    </FormDialog>
  );
}
