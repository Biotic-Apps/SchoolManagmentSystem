import { z } from "zod";
import { blankToUndefined, optionalText, requiredText } from "@/lib/validation";
import type { Asset, AssetCondition, AssetInput } from "./types";

export const assetSchema = z.object({
  itemId: z.string().min(1, "Choose an asset item"),
  tag: requiredText("the asset tag", 40),
  location: requiredText("the location", 120),
  condition: z.string().min(1, "Choose the condition"),
  assignedTo: optionalText(120),
});
export type AssetFormValues = z.infer<typeof assetSchema>;

export function assetDefaults(asset: Asset | null): AssetFormValues {
  return {
    itemId: asset?.itemId ?? asset?.item?.id ?? "",
    tag: asset?.tag ?? "",
    location: asset?.location ?? "",
    condition: asset?.condition ?? "NEW",
    assignedTo: asset?.assignedTo ?? "",
  };
}

export function toAssetInput(values: AssetFormValues): AssetInput {
  return {
    itemId: values.itemId,
    tag: values.tag.trim().toUpperCase(),
    location: values.location.trim(),
    condition: values.condition as AssetCondition,
    assignedTo: blankToUndefined(values.assignedTo),
  };
}
