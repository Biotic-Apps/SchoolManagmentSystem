// WCAG 2.1 contrast of the school's primary colour against white
// (same formula as SchoolWeb/src/features/branding/contrast.ts).

export const DEFAULT_PRIMARY_COLOR = '#0B7F74';
export const MIN_CONTRAST_ON_WHITE = 4.5;

const HEX = /^#[0-9a-fA-F]{6}$/;

export const isHexColor = (value: string): boolean => HEX.test(value);

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

/** Contrast ratio of `#RRGGBB` against white, or null when malformed. */
export function contrastOnWhite(hex: string): number | null {
  if (!isHexColor(hex)) return null;
  return 1.05 / (luminance(hex) + 0.05);
}

/** Error message for an unusable primary colour, or null when it passes. */
export function primaryColorProblem(hex: string): string | null {
  const ratio = contrastOnWhite(hex);
  if (ratio === null) return 'primaryColor must be a hex colour like #0B7F74';
  if (ratio >= MIN_CONTRAST_ON_WHITE) return null;
  return (
    `primaryColor ${hex} has a contrast ratio of ${ratio.toFixed(2)}:1 ` +
    `against white; at least ${MIN_CONTRAST_ON_WHITE}:1 is required`
  );
}
