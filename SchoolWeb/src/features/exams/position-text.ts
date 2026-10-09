import { EMPTY_VALUE } from "@/lib/format";

/** "3rd", "11th", "22nd". */
export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

/** "3rd of 32"; just "3rd" without a size; a dash when positions are off. */
export function positionText(position: number | null | undefined, size?: number): string {
  if (position == null) return EMPTY_VALUE;
  return size ? `${ordinal(position)} of ${size}` : ordinal(position);
}
