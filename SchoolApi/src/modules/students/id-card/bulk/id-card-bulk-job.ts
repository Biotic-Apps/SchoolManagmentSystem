export const ID_CARD_SHEET_JOB = 'documents.idCardSheet';

/** Hard cap so a branch-wide print stays a reasonable PDF. */
export const MAX_SHEET_CARDS = 1500;

export interface IdCardSheetInput {
  schoolId: string;
  requestedById: string;
  /** Students in print order (section, then roll number). */
  studentIds: string[];
  baseName: string;
}
