import type { PromotionDecisionKind } from '../../../generated/prisma/client';
import { divRound } from '../shared/hundredths';

export interface PromotionInput {
  /** Highest levelOrder of the school. */
  isLastClass: boolean;
  /** Average percent in hundredths; null when the student has no results. */
  percentH: number | null;
  failedSubjects: number;
  /** `promotion.minPassPercent` (whole percent). */
  minPassPercent: number;
}

export interface PromotionSuggestion {
  decision: PromotionDecisionKind;
  note: string | null;
}

export const MAX_CONDITIONAL_FAILS = 2;

/**
 * Last class: GRADUATE when passed else REPEAT. Otherwise PROMOTE (≥ min and
 * nothing failed), CONDITIONAL (≥ min with ≤ 2 failed subjects) or REPEAT.
 * No results → CONDITIONAL so a person decides.
 */
export function suggestPromotion(input: PromotionInput): PromotionSuggestion {
  if (input.percentH === null)
    return {
      decision: 'CONDITIONAL',
      note: 'No results for the selected exams',
    };
  const aboveMin = input.percentH >= input.minPassPercent * 100;
  const passed = aboveMin && input.failedSubjects === 0;
  if (input.isLastClass)
    return { decision: passed ? 'GRADUATE' : 'REPEAT', note: null };
  if (passed) return { decision: 'PROMOTE', note: null };
  if (aboveMin && input.failedSubjects <= MAX_CONDITIONAL_FAILS)
    return { decision: 'CONDITIONAL', note: null };
  return { decision: 'REPEAT', note: null };
}

/** Mean of percents (hundredths), half up; null for none. */
export function averagePercentH(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return divRound(
    values.reduce((sum, v) => sum + v, 0),
    values.length,
  );
}

/** Distinct subjects failed in any of the results. */
export function failedSubjectCount(
  results: readonly {
    subjects: readonly { subjectId: string; passed: boolean }[];
  }[],
): number {
  const failed = new Set<string>();
  for (const result of results)
    for (const subject of result.subjects)
      if (!subject.passed) failed.add(subject.subjectId);
  return failed.size;
}

/** PROMOTE/CONDITIONAL move up a class; REPEAT stays; GRADUATE leaves. */
export function targetClassId(
  decision: PromotionDecisionKind,
  fromClassId: string,
  nextClassId: string | null,
): string | null {
  if (decision === 'GRADUATE') return null;
  if (decision === 'REPEAT') return fromClassId;
  return nextClassId;
}
