import type { CSSProperties } from "react";
import { DEFAULT_PRIMARY, passesContrast } from "./contrast";

/** Overrides --primary for a branded area only when the colour passes WCAG AA on white. */
export function brandStyle(primaryColor: string | null | undefined): CSSProperties | undefined {
  if (!primaryColor || !passesContrast(primaryColor)) return undefined;
  const color = primaryColor.trim();
  // The default colour keeps the hand-picked hover token from globals.css.
  if (color.toUpperCase() === DEFAULT_PRIMARY) return undefined;
  return { "--primary": color, "--primary-hover": `color-mix(in srgb, ${color} 85%, black)` } as CSSProperties;
}
