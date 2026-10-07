"use client";

import type { FormEventHandler, ReactNode } from "react";
import { FormProvider, type FieldValues, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { cn } from "@/lib/cn";
import { FormAlert } from "./FormAlert";

const SIZE_CLASS = { md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

const FIRST_FIELD = "input:not([type=hidden]):not([disabled]), textarea:not([disabled]), button[role=combobox]:not([disabled])";

/** Opening a form dialog puts the cursor in its first field rather than on a button. */
export function focusFirstField(event: Event) {
  const field = (event.target as HTMLElement | null)?.querySelector<HTMLElement>(FIRST_FIELD);
  if (!field) return;
  event.preventDefault();
  field.focus();
}

interface FormDialogProps<T extends FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** Provides the form to field components (TextField, SelectField, ...). */
  form?: UseFormReturn<T>;
  error?: string | null;
  size?: keyof typeof SIZE_CLASS;
  children: ReactNode;
}

export function FormDialog<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = "Save",
  submitting,
  onSubmit,
  form,
  error,
  size = "md",
  children,
}: FormDialogProps<T>) {
  const body = (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert message={error} />
      {children}
      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(SIZE_CLASS[size])} onOpenAutoFocus={focusFirstField}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {form ? <FormProvider {...form}>{body}</FormProvider> : body}
      </DialogContent>
    </Dialog>
  );
}
