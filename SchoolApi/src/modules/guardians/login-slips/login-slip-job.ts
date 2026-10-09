export const LOGIN_SLIPS_JOB = 'documents.loginSlips';

/** Hard cap so one print stays a reasonable PDF (and a reviewable reset). */
export const MAX_LOGIN_SLIPS = 600;

/** Job data never carries passwords: they are made inside the job. */
export interface LoginSlipsInput {
  schoolId: string;
  branchId: string;
  requestedById: string;
  /** Students in print order (section, then roll number). */
  studentIds: string[];
  baseName: string;
  /** Sign-in page printed and encoded in the QR code. */
  loginUrl: string;
}
