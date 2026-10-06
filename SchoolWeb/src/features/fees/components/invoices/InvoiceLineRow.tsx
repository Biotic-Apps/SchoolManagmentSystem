"use client";

import { Trash2 } from "lucide-react";
import type { Option } from "@/components/shared/OptionSelect";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";

interface InvoiceLineRowProps {
  prefix: string;
  index: number;
  headOptions: Option[];
  onRemove?: () => void;
}

export function InvoiceLineRow({ prefix, index, headOptions, onRemove }: InvoiceLineRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-input border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-caption font-medium text-fg-muted">Line {index + 1}</span>
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove line ${index + 1}`}>
            <Trash2 />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SelectField name={`${prefix}.feeHeadId`} label="Fee head" options={headOptions} required />
        <TextField name={`${prefix}.description`} label="Description" required />
        <MoneyField name={`${prefix}.amount`} label="Amount" required />
      </div>
    </div>
  );
}
