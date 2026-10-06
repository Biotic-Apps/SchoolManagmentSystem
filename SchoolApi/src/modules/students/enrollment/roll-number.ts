/** Smallest positive roll number not already used in the section. */
export function nextRollNo(taken: Iterable<number | null>): number {
  const used = new Set<number>();
  for (const value of taken) if (value !== null) used.add(value);
  let candidate = 1;
  while (used.has(candidate)) candidate++;
  return candidate;
}
