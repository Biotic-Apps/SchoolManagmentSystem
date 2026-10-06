"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import type { BookList } from "../types";
import { useBookListEditor } from "../use-book-list-editor";
import { BookItemsFields } from "./BookItemsFields";

interface BookListEditorDialogProps {
  branchId: string;
  sessionId: string;
  classId: string;
  source: BookList | null;
  isNewRevision: boolean;
  onClose: () => void;
}

export function BookListEditorDialog({ isNewRevision, onClose, ...args }: BookListEditorDialogProps) {
  const { form, submit, submitting, formError, subjectOptions } = useBookListEditor({ ...args, onDone: onClose });
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={isNewRevision ? "New book list revision" : "Edit book list draft"}
      description={
        isNewRevision
          ? "Starts from the approved list. Guardians see the change only after the new revision is approved."
          : "Save the draft, then submit it for approval."
      }
      submitLabel="Save draft"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="xl"
    >
      <BookItemsFields subjectOptions={subjectOptions} />
    </FormDialog>
  );
}
