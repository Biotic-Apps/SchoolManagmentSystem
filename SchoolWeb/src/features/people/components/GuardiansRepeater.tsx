"use client";

import { Plus, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useGuardiansRepeater } from "../use-guardians-repeater";
import { GuardianFields } from "./GuardianFields";

/** Repeatable guardian rows bound to the form's "guardians" array; exactly one is primary. */
export function GuardiansRepeater() {
  const repeater = useGuardiansRepeater();

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-label font-medium text-fg">Parents and guardians</legend>
      {repeater.fields.map((field, index) => {
        const primary = !!repeater.rows[index]?.isPrimary;
        return (
          <div key={field.id} className="flex flex-col gap-3 rounded-input border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-caption font-medium text-fg-muted">
                Guardian {index + 1}
                {primary && <Badge tone="primary">Primary contact</Badge>}
              </span>
              <div className="flex gap-1">
                {!primary && (
                  <Button variant="ghost" size="sm" onClick={() => repeater.makePrimary(index)}>
                    <Star />
                    Make primary
                  </Button>
                )}
                {repeater.fields.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => repeater.removeRow(index)}
                    aria-label={`Remove guardian ${index + 1}`}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>
            <GuardianFields prefix={`guardians.${index}`} />
          </div>
        );
      })}
      {repeater.listError && (
        <p role="alert" className="text-caption text-error">
          {repeater.listError}
        </p>
      )}
      <Button variant="secondary" size="sm" className="self-start" onClick={repeater.add}>
        <Plus />
        Add guardian
      </Button>
    </fieldset>
  );
}
