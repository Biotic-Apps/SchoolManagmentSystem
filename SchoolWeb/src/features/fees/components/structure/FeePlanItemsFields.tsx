"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { Option } from "@/components/shared/OptionSelect";
import { Button } from "@/components/ui/Button";
import { EMPTY_PLAN_ITEM, type FeePlanFormValues } from "../../structure-schemas";
import { FeePlanItemRow } from "./FeePlanItemRow";

export function FeePlanItemsFields({ headOptions }: { headOptions: Option[] }) {
  const { control, formState } = useFormContext<FeePlanFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const listError = formState.errors.items?.root?.message ?? formState.errors.items?.message;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-label font-medium text-fg">Fees</legend>
      {fields.map((field, index) => (
        <FeePlanItemRow
          key={field.id}
          prefix={`items.${index}`}
          index={index}
          headOptions={headOptions}
          onRemove={fields.length > 1 ? () => remove(index) : undefined}
        />
      ))}
      {listError && (
        <p role="alert" className="text-caption text-error">
          {listError}
        </p>
      )}
      <Button variant="secondary" size="sm" className="self-start" onClick={() => append({ ...EMPTY_PLAN_ITEM })}>
        <Plus />
        Add fee
      </Button>
    </fieldset>
  );
}
