import type { ReportFormatName } from './report-catalog';
import type { ReportParams } from './report-params';

export const REPORT_JOB = 'reports.generate';

/** Validated and scope-checked before queueing; the processor just runs it. */
export interface ReportJobInput {
  key: string;
  params: ReportParams;
  format: ReportFormatName;
  schoolId: string;
  requestedById: string;
}
