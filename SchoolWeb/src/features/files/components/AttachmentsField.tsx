"use client";

import { useRef } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { DOCUMENT_MAX_MB, DOCUMENT_TYPES, type Attachment } from "../types";
import { useAttachmentsField } from "../use-attachments-field";

interface AttachmentsFieldProps {
  /** Form field (string[]) that receives the uploaded file ids. */
  name: string;
  label?: string;
  initial?: Attachment[];
  max?: number;
}

/** Multi-file attachment picker for forms (diary, notices, messages, complaints, incidents). */
export function AttachmentsField({ name, label = "Attachments", initial, max = 5 }: AttachmentsFieldProps) {
  const field = useAttachmentsField(name, initial, max);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = `field-${name}`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {field.items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {field.items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 rounded-input border border-border px-3 py-2">
              <FileText className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-label text-fg">{item.name}</span>
              <Button variant="ghost" size="sm" aria-label={`Remove ${item.name}`} onClick={() => field.remove(item.id)}>
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {field.canAdd && (
        <div>
          <Button variant="secondary" size="sm" loading={field.uploading} onClick={() => inputRef.current?.click()}>
            <Paperclip />
            Attach file
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={DOCUMENT_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) field.onFile(file);
        }}
      />
      {field.error ? (
        <p role="alert" className="text-caption text-error">
          {field.error}
        </p>
      ) : (
        <p className="text-caption text-fg-muted">
          PDF, Word or image up to {DOCUMENT_MAX_MB} MB each, at most {max} files.
        </p>
      )}
    </div>
  );
}
