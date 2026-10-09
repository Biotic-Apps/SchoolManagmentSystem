const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

/** 0–99 in words ("" for 0). */
function belowHundred(n: number): string {
  if (n < 20) return ONES[n];
  const rest = ONES[n % 10];
  return rest ? `${TENS[Math.floor(n / 10)]}-${rest}` : TENS[n / 10];
}

/** 0–999 in words ("" for 0). */
function belowThousand(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = belowHundred(n % 100);
  if (!hundreds) return rest;
  return rest
    ? `${ONES[hundreds]} Hundred ${rest}`
    : `${ONES[hundreds]} Hundred`;
}

/** South-Asian grouping: crore (10^7), lakh (10^5), thousand, hundred. */
export function wholeInWords(value: bigint): string {
  if (value === 0n) return 'Zero';
  const parts: string[] = [];
  let rest = value;
  const crore = rest / 10_000_000n;
  rest %= 10_000_000n;
  if (crore > 0n) parts.push(`${wholeInWords(crore)} Crore`);
  const lakh = Number(rest / 100_000n);
  rest %= 100_000n;
  if (lakh) parts.push(`${belowHundred(lakh)} Lakh`);
  const thousand = Number(rest / 1_000n);
  rest %= 1_000n;
  if (thousand) parts.push(`${belowHundred(thousand)} Thousand`);
  const tail = belowThousand(Number(rest));
  if (tail) parts.push(tail);
  return parts.join(' ');
}

/**
 * Amount in minor units as printed on challans and receipts, e.g.
 * `1250050n` → "Rupees Twelve Thousand Five Hundred and Fifty Paisa Only".
 */
export function amountInWords(amountMinor: bigint, currency = 'PKR'): string {
  const abs = amountMinor < 0n ? -amountMinor : amountMinor;
  const major = abs / 100n;
  const minor = Number(abs % 100n);
  const unit = currency === 'PKR' ? 'Rupees' : currency;
  const sign = amountMinor < 0n ? 'Minus ' : '';
  const paisa = minor ? ` and ${belowHundred(minor)} Paisa` : '';
  return `${sign}${unit} ${wholeInWords(major)}${paisa} Only`;
}
