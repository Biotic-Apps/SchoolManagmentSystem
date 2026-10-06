"use client";

import { Plus, Trash2 } from "lucide-react";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import type { StructureFormState } from "../use-structure-form";

interface SalaryItemsFieldsProps {
  name: "allowances" | "deductions";
  title: string;
  itemLabel: string;
  placeholder: string;
  rows: StructureFormState["allowances"] | StructureFormState["deductions"];
}

/** Repeating name + amount rows for allowances or deductions. */
export function SalaryItemsFields({ name, title, itemLabel, placeholder, rows }: SalaryItemsFieldsProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-label font-semibold text-fg">{title}</legend>
      {rows.fields.length === 0 && <p className="text-label text-fg-muted">None added.</p>}
      {rows.fields.map((field, index) => (
        <div key={field.id} className="grid items-start gap-3 sm:grid-cols-[1fr_12rem_auto]">
          <TextField name={`${name}.${index}.name`} label={`${itemLabel} name`} placeholder={placeholder} required />
          <MoneyField name={`${name}.${index}.amount`} label="Amount" required />
          <Button
            variant="ghost"
            size="icon"
            className="sm:mt-6"
            aria-label={`Remove ${itemLabel.toLowerCase()} ${index + 1}`}
            onClick={() => rows.remove(index)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button variant="secondary" size="sm" className="self-start" onClick={() => rows.append({ name: "", amount: "" })}>
        <Plus />
        Add {itemLabel.toLowerCase()}
      </Button>
    </fieldset>
  );
}
