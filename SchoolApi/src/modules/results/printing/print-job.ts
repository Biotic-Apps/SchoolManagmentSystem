export const EXAM_PRINT_JOB = 'results.print';

export const EXAM_PRINT_KINDS = [
  'REPORT_CARDS',
  'DATE_SHEET',
  'AWARD_LIST',
] as const;
export type ExamPrintKind = (typeof EXAM_PRINT_KINDS)[number];

export interface ExamPrintInput {
  examId: string;
  kind: ExamPrintKind;
  schoolId: string;
  requestedById: string;
  /** Sections to print (report cards, award lists), in print order. */
  sectionIds: string[];
  /** Classes to print (date sheet), in print order. */
  classIds: string[];
  /** Award list for one paper instead of every subject. */
  subjectId?: string;
}

/** What a composer hands back to the processor. */
export interface ComposedPdf {
  buffer: Buffer;
  baseName: string;
  count: number;
}

export type Progress = (percent: number) => Promise<void>;
