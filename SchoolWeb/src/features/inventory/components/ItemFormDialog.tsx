"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { ITEM_CATEGORY_OPTIONS } from "../options";
import { useItemForm } from "../use-item-form";

export function ItemFormDialog({ schoolId, onClose }: { schoolId: string; onClose: () => void }) {
  const item = useItemForm(schoolId, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add item"
      description="Items are shared by every branch of the school; stock is kept per branch."
      submitLabel="Add item"
      submitting={item.submitting}
      onSubmit={item.submit}
      form={item.form}
      error={item.formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="sku" label="SKU" required maxLength={40} placeholder="e.g. NB-200" />
        <TextField name="name" label="Item name" required maxLength={120} />
        <SelectField name="category" label="Category" options={ITEM_CATEGORY_OPTIONS} required />
        <TextField name="unit" label="Unit" required maxLength={20} hint="e.g. piece, pack, set" />
        <TextField
          name="reorderLevel"
          label="Reorder level"
          required
          inputMode="numeric"
          inputClassName="text-right tabular-nums"
          hint="Warn when stock falls to this quantity."
        />
      </div>
      <CheckboxField name="isAsset" label="Track as asset" hint="Each unit gets a tag, location and condition." />
      <CheckboxField name="saleable" label="Sold to students" hint="e.g. uniforms and books, billed on the invoice." />
      {item.saleable && <MoneyField name="salePrice" label="Sale price" required className="sm:w-1/2" />}
    </FormDialog>
  );
}
