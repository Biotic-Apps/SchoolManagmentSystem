"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { MoneyText } from "@/components/shared/MoneyText";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import { usePurchaseRequestForm } from "../use-purchase-request-form";

interface PurchaseRequestFormDialogProps {
  branchId: string;
  itemOptions: Option[];
  onClose: () => void;
}

export function PurchaseRequestFormDialog({ branchId, itemOptions, onClose }: PurchaseRequestFormDialogProps) {
  const request = usePurchaseRequestForm(branchId, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="New purchase request"
      description="Goes for approval; once approved it can be turned into a purchase order."
      submitLabel="Send for approval"
      submitting={request.submitting}
      onSubmit={request.submit}
      form={request.form}
      error={request.formError}
      size="xl"
    >
      <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto pr-1">
        {request.rows.map((row, index) => (
          <div
            key={row.id}
            className="grid gap-3 rounded-input border border-border p-3 md:grid-cols-[minmax(0,1fr)_6rem_10rem_8rem_auto] md:items-start"
          >
            <SelectField name={`lines.${index}.itemId`} label="Item" options={itemOptions} required />
            <TextField
              name={`lines.${index}.quantity`}
              label="Quantity"
              required
              inputMode="numeric"
              inputClassName="text-right tabular-nums"
            />
            <MoneyField name={`lines.${index}.estimatedUnit`} label="Unit price (est.)" required />
            <div className="flex flex-col gap-1.5 md:text-right">
              <span className="text-label font-medium text-fg">Line total</span>
              <MoneyText amountMinor={request.lineTotals[index] ?? 0} className="py-2.5 text-label" />
            </div>
            <div className="flex items-end md:pt-7">
              {request.rows.length > 1 && (
                <Button variant="ghost" size="icon" aria-label="Remove item" onClick={() => request.removeRow(index)}>
                  <Trash2 />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {request.linesError && <p className="text-caption text-error">{request.linesError}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={request.addRow}>
          <Plus />
          Add item
        </Button>
        <p className="text-label text-fg-muted">
          Estimated total <MoneyText amountMinor={request.total} className="ml-1 text-body font-semibold text-fg" />
        </p>
      </div>
      <TextareaField name="reason" label="Reason" required rows={2} placeholder="Why these items are needed" />
    </FormDialog>
  );
}
