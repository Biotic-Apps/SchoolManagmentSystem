"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { FormDialog } from "@/components/shared/FormDialog";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import type { SchoolClass } from "../types";
import { useClassSubjectsForm } from "../use-class-subjects-form";

interface ClassSubjectsDialogProps {
  item: SchoolClass;
  onClose: () => void;
}

export function ClassSubjectsDialog({ item, onClose }: ClassSubjectsDialogProps) {
  const mapping = useClassSubjectsForm(item, onClose);
  const ready = !mapping.loading && !mapping.error;

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Subjects for ${item.name}`}
      description="Tick the subjects taught in this class."
      submitLabel="Save subjects"
      submitting={mapping.submitting}
      onSubmit={mapping.submit}
    >
      {mapping.loading && <Skeleton className="h-40 w-full" />}
      {!mapping.loading && !!mapping.error && <ErrorState error={mapping.error} onRetry={mapping.retry} />}
      {ready && mapping.subjects.length === 0 && (
        <EmptyState title="No subjects yet" description="Add subjects in the Subjects tab first." />
      )}
      {ready && mapping.subjects.length > 0 && (
        <ul className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
          {mapping.subjects.map((subject) => {
            const id = `class-subject-${subject.id}`;
            return (
              <li key={subject.id} className="flex items-center gap-3 rounded-input border border-border px-3 py-2">
                <Checkbox
                  id={id}
                  checked={mapping.selected.has(subject.id)}
                  onCheckedChange={(checked) => mapping.toggle(subject.id, checked === true)}
                />
                <Label htmlFor={id} className="flex-1 cursor-pointer">
                  {subject.name}
                  <span className="ml-2 font-mono text-caption text-fg-muted">{subject.code}</span>
                </Label>
              </li>
            );
          })}
        </ul>
      )}
    </FormDialog>
  );
}
