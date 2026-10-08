import { formatNumber } from "@/lib/format";

/** "1 section" / "3 sections". */
export function countLabel(count: number, one: string, many = `${one}s`): string {
  return `${formatNumber(count)} ${count === 1 ? one : many}`;
}

/** Next unused section letter: A, B, … Z, then "S27". */
export function nextSectionName(taken: string[]): string {
  const used = new Set(taken.map((name) => name.trim().toUpperCase()));
  for (let code = 65; code <= 90; code += 1) {
    const letter = String.fromCharCode(code);
    if (!used.has(letter)) return letter;
  }
  return `S${used.size + 1}`;
}
