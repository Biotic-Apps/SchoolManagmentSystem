/** Case-insensitive `contains` filter for Prisma string columns. */
export function containsInsensitive(search?: string) {
  const term = search?.trim();
  return term ? { contains: term, mode: 'insensitive' as const } : undefined;
}
