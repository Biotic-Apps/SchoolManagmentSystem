import { useWatch, type UseFormReturn } from "react-hook-form";
import { DEFAULT_PRIMARY, MIN_CONTRAST, contrastOnWhite, isDefaultPrimary } from "@/features/branding/contrast";
import type { SchoolSettingsValues } from "./school-schemas";

// Rounded down so a colour just under the minimum never reads as "4.5 : 1".
function formatRatio(ratio: number): string {
  return `${(Math.floor(ratio * 10) / 10).toFixed(1)} : 1`;
}

/** Live WCAG contrast state of the primary colour being edited. */
export function usePrimaryColor(form: UseFormReturn<SchoolSettingsValues>) {
  const value = useWatch({ control: form.control, name: "primaryColor" }) ?? "";
  const ratio = contrastOnWhite(value);
  const isHex = ratio !== null;
  const isDefault = isDefaultPrimary(value);
  // The shipped default is always allowed (it is the product theme).
  const meetsAa = isHex && ratio >= MIN_CONTRAST;
  const passes = meetsAa || (isHex && isDefault);

  const setColor = (hex: string) => {
    form.clearErrors("primaryColor");
    form.setValue("primaryColor", hex.trim().toUpperCase(), { shouldDirty: true });
  };

  return {
    value,
    isHex,
    passes,
    meetsAa,
    ratioText: isHex ? formatRatio(ratio) : null,
    /** Native colour inputs only accept lowercase #rrggbb. */
    pickerValue: (isHex ? value : DEFAULT_PRIMARY).trim().toLowerCase(),
    isDefault,
    setColor,
    resetToDefault: () => setColor(DEFAULT_PRIMARY),
  };
}

export type PrimaryColorState = ReturnType<typeof usePrimaryColor>;
