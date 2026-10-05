/** `CUSTOM_<SLUG>` from a role name, e.g. "Exam Cell" → CUSTOM_EXAM_CELL. */
export function customRoleKey(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
    .slice(0, 40);
  return `CUSTOM_${slug || 'ROLE'}`;
}
