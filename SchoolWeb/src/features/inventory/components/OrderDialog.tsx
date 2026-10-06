"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { MoneyText } from "@/components/shared/MoneyText";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import type { PurchaseRequest } from "../types";
import type { ItemLookups } from "../use-item-lookups";
import { useOrderForm } from "../use-order-form";

interface OrderDialogProps {
  request: PurchaseRequest;
  lookups: ItemLookups;
  onClose: () => void;
}

export function OrderDialog({ request, lookups, onClose }: OrderDialogProps) {
  const order = useOrderForm(request, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Create purchase order"
      description="Confirm the vendor and the agreed prices. Items are received against this order."
      submitLabel="Create purchase order"
      submitting={order.submitting}
      onSubmit={order.submit}
      form={order.form}
      error={order.formError}
      size="xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="vendorId"
          label="Vendor"
          options={order.vendorOptions}
          required
          placeholder={!order.vendorsLoading && !order.vendorOptions.length ? "Add a vendor in Expenses first" : "Select"}
        />
        <TextField name="expectedOn" label="Expected on" type="date" />
      </div>
      <div className="flex max-h-[45vh] flex-col gap-3 overflow-y-auto pr-1">
        {request.lines.map((line, index) => (
          <div
            key={line.itemId}
            className="grid gap-3 rounded-input border border-border p-3 md:grid-cols-[minmax(0,1fr)_6rem_10rem_8rem] md:items-start"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-label font-medium text-fg">Item</span>
              <span className="py-2.5 text-label text-fg">{lookups.itemName(line.itemId, line.item)}</span>
            </div>
            <TextField
              name={`lines.${index}.quantity`}
              label="Quantity"
              required
              inputMode="numeric"
              inputClassName="text-right tabular-nums"
            />
            <MoneyField name={`lines.${index}.unitPrice`} label="Unit price" required />
            <div className="flex flex-col gap-1.5 md:text-right">
              <span className="text-label font-medium text-fg">Line total</span>
              <MoneyText amountMinor={order.lineTotals[index] ?? 0} className="py-2.5 text-label" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-right text-label text-fg-muted">
        Order total <MoneyText amountMinor={order.total} className="ml-1 text-body font-semibold text-fg" />
      </p>
    </FormDialog>
  );
}
