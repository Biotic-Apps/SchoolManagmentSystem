"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { ASSET_CONDITION_OPTIONS } from "../options";
import type { Asset } from "../types";
import { useAssetForm } from "../use-asset-form";

interface AssetFormDialogProps {
  branchId: string;
  asset: Asset | null;
  itemOptions: Option[];
  onClose: () => void;
}

export function AssetFormDialog({ branchId, asset, itemOptions, onClose }: AssetFormDialogProps) {
  const form = useAssetForm(branchId, asset, onClose);
  const editing = !!asset;

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={editing ? `Edit asset ${asset.tag}` : "Add asset"}
      description={editing ? undefined : "Only items marked “Track as asset” can be tagged."}
      submitLabel={editing ? "Save changes" : "Add asset"}
      submitting={form.submitting}
      onSubmit={form.submit}
      form={form.form}
      error={form.formError}
    >
      <SelectField
        name="itemId"
        label="Item"
        options={itemOptions}
        required
        placeholder={itemOptions.length ? "Select" : "No asset items yet"}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="tag" label="Asset tag" required maxLength={40} placeholder="e.g. CHR-0012" />
        <SelectField name="condition" label="Condition" options={ASSET_CONDITION_OPTIONS} required />
      </div>
      <TextField name="location" label="Location" required maxLength={120} placeholder="e.g. Room 4, Computer lab" />
      <TextField name="assignedTo" label="Assigned to" maxLength={120} placeholder="Person or department" />
    </FormDialog>
  );
}
