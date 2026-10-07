import { DEFAULT_PRIMARY } from "@/features/branding/contrast";

/** Ready-made primary colours; every one passes WCAG AA (≥ 4.5 : 1) with white text. */
export const PRIMARY_COLOR_PRESETS = [
  { name: "Teal (default)", hex: DEFAULT_PRIMARY },
  { name: "Navy", hex: "#1E4E8C" },
  { name: "Green", hex: "#1F7A45" },
  { name: "Indigo", hex: "#4338CA" },
  { name: "Burgundy", hex: "#7A2944" },
  { name: "Slate", hex: "#334155" },
] as const;
