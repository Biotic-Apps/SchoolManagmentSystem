"use client";

import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext, type FieldArrayPath } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import type { HealthProfileValues } from "../profile-schemas";

type ListName = FieldArrayPath<HealthProfileValues>;

interface ArrayFieldsProps {
  name: ListName;
  itemLabel: string;
  addLabel: string;
  emptyItem: Record<string, string>;
  emptyText: string;
  renderRow: (prefix: string) => ReactNode;
}

/** Repeating group of fields (allergies, medicines, contacts) with add / remove. */
export function ArrayFields({ name, itemLabel, addLabel, emptyItem, emptyText, renderRow }: ArrayFieldsProps) {
  const { control } = useFormContext<HealthProfileValues>();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && <p className="text-label text-fg-muted">{emptyText}</p>}
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-3 rounded-input border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-fg-muted">
              {itemLabel} {index + 1}
            </span>
            <Button variant="ghost" size="sm" onClick={() => remove(index)} aria-label={`Remove ${itemLabel.toLowerCase()} ${index + 1}`}>
              <Trash2 />
            </Button>
          </div>
          {renderRow(`${name}.${index}`)}
        </div>
      ))}
      <Button variant="secondary" size="sm" className="self-start" onClick={() => append({ ...emptyItem } as never)}>
        <Plus />
        {addLabel}
      </Button>
    </div>
  );
}
