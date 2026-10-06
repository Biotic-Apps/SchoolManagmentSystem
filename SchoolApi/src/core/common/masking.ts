/** `35202-1234567-1` → `*****-*******-1` (security.md §5). */
export function maskId(value: string | null): string | null {
  if (!value) return value;
  return value.replace(/[0-9A-Za-z](?=.*[0-9A-Za-z])/g, '*');
}

/** `+923001234567` → `+92*******567`. */
export function maskPhone(value: string): string {
  if (value.length <= 6) return value.replace(/.(?=.{2})/g, '*');
  return value.slice(0, 3) + '*'.repeat(value.length - 6) + value.slice(-3);
}
