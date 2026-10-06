import type { CSSProperties } from "react";
import { passesContrast } from "./contrast";

/** Overrides --primary for a branded area only when the colour passes WCAG AA on white. */
export function brandStyle(primaryColor: string | null | undefined): CSSProperties | undefined {
  if (!primaryColor || !passesContrast(primaryColor)) return undefined;
  return { "--primary": primaryColor.trim() } as CSSProperties;
}
