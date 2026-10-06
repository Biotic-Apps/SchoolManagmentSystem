import type { ConcessionType } from '../../../generated/prisma/client';
import { minBig, percentOf, sumMinor } from '../../finance-core/money';

export interface ConcessionRule {
  id: string;
  /** null = the whole invoice (all plan lines). */
  feeHeadId: string | null;
  type: ConcessionType;
  /** PERCENT: whole percent 1–100; FIXED: minor units per invoice. */
  value: bigint;
}

export interface BilledLine {
  feeHeadId: string;
  amountMinor: bigint;
}

export interface AppliedConcession {
  concessionId: string;
  amountMinor: bigint;
}

const amountFor = (rule: ConcessionRule, applicable: bigint): bigint =>
  rule.type === 'PERCENT'
    ? percentOf(applicable, rule.value)
    : minBig(rule.value, applicable);

/**
 * Concessions of one invoice. PERCENT takes a share of the applicable line
 * amounts (rounded half-up), FIXED is capped at them. Fee-head rules apply
 * first and never exceed what is left of that head; whole-invoice rules then
 * never exceed what is left of the subtotal, so the total ≤ subtotal.
 * Zero amounts are omitted.
 */
export function applyConcessions(
  lines: readonly BilledLine[],
  rules: readonly ConcessionRule[],
): AppliedConcession[] {
  const perHead = new Map<string, bigint>();
  for (const line of lines) {
    perHead.set(
      line.feeHeadId,
      (perHead.get(line.feeHeadId) ?? 0n) + line.amountMinor,
    );
  }
  const subtotal = sumMinor(lines.map((line) => line.amountMinor));
  const remainingHead = new Map(perHead);
  let remaining = subtotal;
  const applied: AppliedConcession[] = [];
  const ordered = [
    ...rules.filter((rule) => rule.feeHeadId !== null),
    ...rules.filter((rule) => rule.feeHeadId === null),
  ];
  for (const rule of ordered) {
    let amount: bigint;
    if (rule.feeHeadId !== null) {
      const base = perHead.get(rule.feeHeadId) ?? 0n;
      const left = remainingHead.get(rule.feeHeadId) ?? 0n;
      amount = minBig(minBig(amountFor(rule, base), left), remaining);
      remainingHead.set(rule.feeHeadId, left - amount);
    } else {
      amount = minBig(amountFor(rule, subtotal), remaining);
    }
    remaining -= amount;
    if (amount > 0n)
      applied.push({ concessionId: rule.id, amountMinor: amount });
  }
  return applied;
}

/** Total of the applied concessions. */
export const concessionTotal = (applied: readonly AppliedConcession[]) =>
  sumMinor(applied.map((a) => a.amountMinor));
