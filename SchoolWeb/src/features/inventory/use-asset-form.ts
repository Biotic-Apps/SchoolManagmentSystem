import { useServerForm } from "@/lib/use-server-form";
import { assetDefaults, assetSchema, toAssetInput } from "./asset-schemas";
import { useSaveAsset } from "./assets-api";
import type { Asset } from "./types";

export function useAssetForm(branchId: string, asset: Asset | null, onDone: () => void) {
  const save = useSaveAsset(branchId, asset?.id ?? null);
  return useServerForm({
    schema: assetSchema,
    defaultValues: assetDefaults(asset),
    onSubmit: (values) => save.mutateAsync(toAssetInput(values)),
    onSuccess: onDone,
    conflictField: "tag",
  });
}
