export const STAFF_ID_CARD_SHEET_JOB = 'documents.staffIdCardSheet';

/** Hard cap so a branch-wide print stays a reasonable PDF. */
export const MAX_STAFF_SHEET_CARDS = 1500;

export interface StaffIdCardSheetInput {
  schoolId: string;
  requestedById: string;
  /** Staff in print order (name ascending). */
  staffIds: string[];
  baseName: string;
}
