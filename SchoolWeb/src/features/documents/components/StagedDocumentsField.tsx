"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { SelectField } from "@/components/shared/form/SelectField";
import { Button } from "@/components/ui/Button";
import { UploadField } from "@/features/files/components/UploadField";
import { DOC_TYPE_OPTIONS } from "../options";
import { EMPTY_DOCUMENT, type DocumentFormValues } from "../schemas";

/** Documents picked in a create form (bound to "documents"); saved after the record is created. */
export function StagedDocumentsField() {
  const { control } = useFormContext<{ documents: DocumentFormValues[] }>();
  const { fields, append, remove } = useFieldArray({ control, name: "documents" });

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-3 rounded-input border border-border p-3 sm:flex-row sm:items-start">
          <SelectField
            name={`documents.${index}.docType`}
            label="Document type"
            options={DOC_TYPE_OPTIONS}
            required
            className="sm:w-56"
          />
          <div className="flex-1">
            <UploadField name={`documents.${index}.fileId`} label="File" purpose="DOCUMENT" required />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => remove(index)}
            aria-label={`Remove document ${index + 1}`}
            className="self-end sm:self-start"
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button variant="secondary" size="sm" className="self-start" onClick={() => append({ ...EMPTY_DOCUMENT })}>
        <Plus />
        Add document
      </Button>
    </div>
  );
}
