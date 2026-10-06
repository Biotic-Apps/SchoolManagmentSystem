"use client";

import { Trash2 } from "lucide-react";
import type { Option } from "@/components/shared/OptionSelect";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";

interface BookItemRowProps {
  prefix: string;
  index: number;
  subjectOptions: Option[];
  onRemove?: () => void;
}

export function BookItemRow({ prefix, index, subjectOptions, onRemove }: BookItemRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-input border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-caption font-medium text-fg-muted">Book {index + 1}</span>
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove book ${index + 1}`}>
            <Trash2 />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TextField name={`${prefix}.title`} label="Title" required />
        <SelectField
          name={`${prefix}.subjectId`}
          label="Subject"
          options={subjectOptions}
          emptyLabel="No subject"
          placeholder="No subject"
        />
        <TextField name={`${prefix}.author`} label="Author" />
        <TextField name={`${prefix}.publisher`} label="Publisher" />
        <TextField name={`${prefix}.isbn`} label="ISBN" />
        <TextField name={`${prefix}.price`} label="Price (Rs)" inputMode="decimal" placeholder="e.g. 450" />
      </div>
      <CheckboxField name={`${prefix}.isMandatory`} label="Mandatory" hint="Optional books are listed as recommended." />
    </div>
  );
}
