"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { EMPTY_INVOICE_LINE, type AdHocInvoiceValues } from "../../invoice-schemas";
import { useFeeHeadOptions } from "../../use-fee-head-options";
import { InvoiceLineRow } from "./InvoiceLineRow";

export function InvoiceLinesFields({ schoolId }: { schoolId: string | null }) {
  const { control, formState } = useFormContext<AdHocInvoiceValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const headOptions = useFeeHeadOptions(schoolId);
  const listError = formState.errors.lines?.root?.message ?? formState.errors.lines?.message;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-label font-medium text-fg">Lines</legend>
      {fields.map((field, index) => (
        <InvoiceLineRow
          key={field.id}
          prefix={`lines.${index}`}
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
      <Button variant="secondary" size="sm" className="self-start" onClick={() => append({ ...EMPTY_INVOICE_LINE })}>
        <Plus />
        Add line
      </Button>
    </fieldset>
  );
}
