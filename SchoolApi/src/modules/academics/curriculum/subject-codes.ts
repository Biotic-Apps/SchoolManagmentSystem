/** Fixed codes of the catalogue subjects (academics-timetable-contract §5.1). */
export const CATALOGUE_CODES: Readonly<Record<string, string>> = {
  english: 'ENG',
  urdu: 'URDU',
  mathematics: 'MATH',
  'general science': 'SCI',
  islamiat: 'ISL',
  'social studies': 'SST',
  'computer science': 'CS',
  'nazra quran': 'QURAN',
  'tarjuma-tul-quran': 'TQ',
  'general knowledge': 'GK',
  'art & drawing': 'ART',
  'pakistan studies': 'PST',
  physics: 'PHY',
  chemistry: 'CHEM',
  biology: 'BIO',
  civics: 'CIV',
  economics: 'ECO',
};

const key = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

/** Catalogue code, else initials ("Pak Studies" → "PS"; one word → first 3 letters). */
export function baseCode(name: string): string {
  const known = CATALOGUE_CODES[key(name)];
  if (known) return known;
  const words = name
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);
  const initials = words.map((w) => w[0]).join('');
  const code = words.length === 1 ? words[0].slice(0, 3) : initials;
  return (code || 'SUB').slice(0, 10);
}

/** A code not in `taken`: base, then base2, base3 … (adds the result to `taken`). */
export function uniqueCode(name: string, taken: Set<string>): string {
  const base = baseCode(name);
  let code = base;
  for (let n = 2; taken.has(code); n++) code = `${base}${n}`;
  taken.add(code);
  return code;
}
