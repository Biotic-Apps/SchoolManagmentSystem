import type {
  ExamStatus,
  MarkSheetStatus,
} from '../../../generated/prisma/client';

export type SheetDecision = 'ACCEPTED' | 'RETURNED';

export interface ReviewInput {
  sheetStatus: MarkSheetStatus;
  examStatus: ExamStatus;
  decision: SheetDecision;
  /** Names of roster students with neither marks nor Absent. */
  pendingNames: readonly string[];
  comment?: string | null;
}

export const pendingText = (names: readonly string[]): string =>
  names.length <= 3
    ? names.join(', ')
    : `${names.slice(0, 3).join(', ')} and ${names.length - 3} more`;

/**
 * Why a review decision is refused (null when allowed).
 * - Accept: only a submitted sheet with every roster student entered or
 *   marked Absent (a student enrolled after submission leaves a pending row).
 * - Return: a submitted sheet, or an accepted one (with a reason) while
 *   marks entry is open — reopen marks entry first when it is closed.
 */
export function reviewProblem(input: ReviewInput): string | null {
  const { sheetStatus, examStatus, decision, pendingNames } = input;
  if (decision === 'ACCEPTED') {
    if (sheetStatus !== 'SUBMITTED')
      return 'Only submitted mark sheets can be accepted';
    if (examStatus !== 'MARKS_OPEN')
      return 'Marks entry is not open for this exam';
    if (pendingNames.length > 0)
      return `Marks are missing for ${pendingText(pendingNames)}. Return the sheet so the teacher can enter marks or mark them Absent.`;
    return null;
  }
  if (sheetStatus !== 'SUBMITTED' && sheetStatus !== 'ACCEPTED')
    return 'Only submitted or accepted mark sheets can be returned';
  if (examStatus !== 'MARKS_OPEN')
    return 'Marks entry is closed. Reopen marks entry first, then return the sheet.';
  if (sheetStatus === 'ACCEPTED' && !input.comment?.trim())
    return 'Give a reason for returning an accepted sheet';
  return null;
}

/** Exam states from which marks entry may be reopened (results not published). */
export const REOPENABLE_EXAM: readonly ExamStatus[] = [
  'MARKS_CLOSED',
  'RESULTS_APPROVED',
];

/** Why marks entry cannot be reopened (null when allowed). */
export function reopenProblem(
  examStatus: ExamStatus,
  approvalPending: boolean,
): string | null {
  if (examStatus === 'PUBLISHED')
    return 'Results are published; marks entry cannot be reopened';
  if (!REOPENABLE_EXAM.includes(examStatus))
    return `Marks entry can only be reopened after it is closed (the exam is ${examStatus.toLowerCase().replace('_', ' ')})`;
  if (approvalPending)
    return 'Results are awaiting approval. Reject or return that request on Approvals first, then reopen marks entry.';
  return null;
}

export interface PendingSheet {
  className: string;
  sectionName: string;
  subjectName: string;
  students: readonly string[];
}

/** "Bilal Yousaf (Grade 1 A · Urdu); …" for compute/close errors. */
export function describePending(sheets: readonly PendingSheet[]): string {
  const parts = sheets.map(
    (s) =>
      `${pendingText(s.students)} (${s.className} ${s.sectionName} · ${s.subjectName})`,
  );
  const shown = parts.slice(0, 5).join('; ');
  return parts.length > 5
    ? `${shown}; and ${parts.length - 5} more sheets`
    : shown;
}
