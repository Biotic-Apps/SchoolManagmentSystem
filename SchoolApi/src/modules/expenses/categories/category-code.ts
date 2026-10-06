/** `Office Supplies` → `OFFICE_SUPPLIES` (upper snake case, max 30 chars). */
export function categoryCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);
}
