"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { useVendorForm } from "../use-catalog-forms";

export function VendorFormDialog({ onClose }: { onClose: () => void }) {
  const vendor = useVendorForm(onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add vendor"
      submitLabel="Add vendor"
      submitting={vendor.submitting}
      onSubmit={vendor.submit}
      form={vendor.form}
      error={vendor.formError}
      size="lg"
    >
      <TextField name="name" label="Vendor name" required maxLength={150} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="contactPerson" label="Contact person" maxLength={100} />
        <TextField name="phone" label="Phone" type="tel" />
        <TextField name="email" label="Email" type="email" />
        <TextField name="ntn" label="NTN" hint="National tax number" maxLength={30} />
      </div>
      <TextareaField name="address" label="Address" rows={2} />
    </FormDialog>
  );
}
