import { formatDate } from '../../core/common/dates';
import { invalid } from '../../core/common/errors/errors';
import { schoolDate } from '../../core/common/school-time';

/**
 * backendFlows §8: a PUBLISHED entry may be edited (keeping a revision) until
 * the end of its own day on the school clock; afterwards it is closed. The
 * branch `diary.closingTime` only drives the missing-diary check.
 */
export function publishedEditable(entryDate: Date, now = new Date()): boolean {
  return formatDate(entryDate) === schoolDate(now);
}

/** Homework cannot be due before the day it was set. */
export function assertDueDate(date: Date, dueDate: Date | null): void {
  if (dueDate && dueDate < date)
    throw invalid('The homework due date cannot be before the diary date');
}
