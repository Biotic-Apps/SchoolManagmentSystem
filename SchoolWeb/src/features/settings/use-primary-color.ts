import { useWatch, type UseFormReturn } from "react-hook-form";
import { DEFAULT_PRIMARY, MIN_CONTRAST, contrastOnWhite } from "@/features/branding/contrast";
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
  const passes = isHex && ratio >= MIN_CONTRAST;

  const setColor = (hex: string) => {
    form.clearErrors("primaryColor");
    form.setValue("primaryColor", hex.trim().toUpperCase(), { shouldDirty: true });
  };

  return {
    value,
    isHex,
    passes,
    ratioText: isHex ? formatRatio(ratio) : null,
    /** Native colour inputs only accept lowercase #rrggbb. */
    pickerValue: (isHex ? value : DEFAULT_PRIMARY).trim().toLowerCase(),
    isDefault: value.trim().toUpperCase() === DEFAULT_PRIMARY,
    setColor,
    resetToDefault: () => setColor(DEFAULT_PRIMARY),
  };
}

export type PrimaryColorState = ReturnType<typeof usePrimaryColor>;
