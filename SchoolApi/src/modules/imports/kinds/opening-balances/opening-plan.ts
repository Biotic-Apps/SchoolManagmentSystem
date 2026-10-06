/** Pure planning + reconciliation for OPENING_BALANCES imports. */

export interface OpeningLine {
  row: number;
  admissionNo: string;
  studentId: string;
  amountMinor: number;
  asOfDate: string;
}

export interface OpeningPlan {
  lines: OpeningLine[];
  fileTotalMinor: number;
  students: number;
}

export interface OpeningReconciliation {
  fileTotalMinor: number;
  importedTotalMinor: number;
  students: number;
  matches: boolean;
}

/**
 * One opening invoice per student; a student twice is an error (rows are
 * never summed). Amounts must be positive whole minor units.
 */
export function planOpeningBalances(lines: OpeningLine[]): OpeningPlan {
  const seen = new Set<string>();
  let total = 0;
  for (const line of lines) {
    if (seen.has(line.studentId)) {
      throw new Error(
        `Row ${line.row}: student ${line.admissionNo} appears twice`,
      );
    }
    if (!Number.isSafeInteger(line.amountMinor) || line.amountMinor <= 0) {
      throw new Error(`Row ${line.row}: amount must be positive`);
    }
    seen.add(line.studentId);
    total += line.amountMinor;
  }
  if (!Number.isSafeInteger(total)) throw new Error('Total is too large');
  return { lines, fileTotalMinor: total, students: seen.size };
}

/** File total vs what reached the ledger as OPENING_BALANCE charges. */
export function reconcileOpening(
  plan: OpeningPlan,
  importedTotalMinor: number,
): OpeningReconciliation {
  return {
    fileTotalMinor: plan.fileTotalMinor,
    importedTotalMinor,
    students: plan.students,
    matches: plan.fileTotalMinor === importedTotalMinor,
  };
}
