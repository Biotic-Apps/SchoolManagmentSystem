import { invalid } from '../errors/errors';

export function assertDateRange(start: Date, end: Date): void {
  if (end < start) {
    throw invalid('endDate must be on or after startDate');
  }
}
