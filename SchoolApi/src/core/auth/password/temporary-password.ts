import { randomInt } from 'node:crypto';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';

/** Readable 12-char temporary password that satisfies the policy. */
export function generateTemporaryPassword(): string {
  const pick = (set: string) => set[randomInt(set.length)];
  const chars = [pick(LETTERS), pick(DIGITS)];
  const all = LETTERS + DIGITS;
  while (chars.length < 12) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
