"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import type { PurchaseOrder } from "../types";
import type { ItemLookups } from "../use-item-lookups";
import { useReceiveForm } from "../use-receive-form";

interface ReceiveDialogProps {
  order: PurchaseOrder;
  lookups: ItemLookups;
  onClose: () => void;
}

export function ReceiveDialog({ order, lookups, onClose }: ReceiveDialogProps) {
  const receive = useReceiveForm(order, onClose);
  const lineFor = (itemId: string) => order.lines.find((line) => line.itemId === itemId);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Receive items · ${order.poNo}`}
      description="Enter what arrived. Partial deliveries are fine; the rest stays outstanding."
      submitLabel="Receive into stock"
      submitting={receive.submitting}
      onSubmit={receive.submit}
      form={receive.form}
      error={receive.formError}
      size="lg"
    >
      <TextField name="receivedOn" label="Received on" type="date" required className="sm:w-1/2" />
      <div className="flex max-h-[45vh] flex-col gap-3 overflow-y-auto pr-1">
        {receive.lines.map((line, index) => (
          <div
            key={line.itemId}
            className="grid gap-3 rounded-input border border-border p-3 sm:grid-cols-[minmax(0,1fr)_8rem] sm:items-start"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-label font-medium text-fg">
                {lookups.itemName(line.itemId, lineFor(line.itemId)?.item)}
              </span>
              <span className="text-caption text-fg-muted">Outstanding: {line.outstanding}</span>
            </div>
            <TextField
              name={`lines.${index}.quantity`}
              label="Received"
              inputMode="numeric"
              inputClassName="text-right tabular-nums"
            />
          </div>
        ))}
      </div>
      {receive.linesError && <p className="text-caption text-error">{receive.linesError}</p>}
    </FormDialog>
  );
}
