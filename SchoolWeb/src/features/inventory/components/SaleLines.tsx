"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Option } from "@/components/shared/OptionSelect";
import { MoneyText } from "@/components/shared/MoneyText";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import type { useSaleForm } from "../use-sale-form";

interface SaleLinesProps {
  sale: ReturnType<typeof useSaleForm>;
  itemOptions: Option[];
}

export function SaleLines({ sale, itemOptions }: SaleLinesProps) {
  return (
    <div className="flex flex-col gap-3">
      {sale.rows.map((row, index) => (
        <div
          key={row.id}
          className="grid gap-3 rounded-input border border-border p-3 md:grid-cols-[minmax(0,1fr)_6rem_8rem_8rem_auto] md:items-start"
        >
          <SelectField name={`lines.${index}.itemId`} label="Item" options={itemOptions} required />
          <TextField
            name={`lines.${index}.quantity`}
            label="Quantity"
            required
            inputMode="numeric"
            inputClassName="text-right tabular-nums"
          />
          <div className="flex flex-col gap-1.5 md:text-right">
            <span className="text-label font-medium text-fg">Price</span>
            <MoneyText amountMinor={sale.priced[index]?.price} className="py-2.5 text-label" />
          </div>
          <div className="flex flex-col gap-1.5 md:text-right">
            <span className="text-label font-medium text-fg">Line total</span>
            <MoneyText amountMinor={sale.priced[index]?.total ?? 0} className="py-2.5 text-label" />
          </div>
          <div className="flex items-end md:pt-7">
            {sale.rows.length > 1 && (
              <Button variant="ghost" size="icon" aria-label="Remove item" onClick={() => sale.removeRow(index)}>
                <Trash2 />
              </Button>
            )}
          </div>
        </div>
      ))}
      {sale.linesError && <p className="text-caption text-error">{sale.linesError}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={sale.addRow}>
          <Plus />
          Add item
        </Button>
        <p className="text-label text-fg-muted">
          Total to invoice <MoneyText amountMinor={sale.total} className="ml-1 text-body font-semibold text-fg" />
        </p>
      </div>
    </div>
  );
}
