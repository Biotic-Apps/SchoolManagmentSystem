// WCAG 2.1 contrast helpers for the school's primary colour (phase5-contract §A).

export const DEFAULT_PRIMARY = "#7A2944";
export const MIN_CONTRAST = 4.5;

const HEX = /^#([0-9a-f]{6})$/i;

export function isHexColor(value: string): boolean {
  return HEX.test(value.trim());
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

/** Contrast ratio of a colour against white, or null when it is not a #RRGGBB hex. */
export function contrastOnWhite(hex: string): number | null {
  if (!isHexColor(hex)) return null;
  return 1.05 / (luminance(hex.trim()) + 0.05);
}

export function passesContrast(hex: string | null | undefined): boolean {
  const ratio = hex ? contrastOnWhite(hex) : null;
  return ratio !== null && ratio >= MIN_CONTRAST;
}
