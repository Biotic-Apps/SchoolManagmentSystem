import { Injectable } from '@nestjs/common';
import { parseDate } from '../../core/common/dates';
import { schoolDate, schoolTime } from '../../core/common/school-time';
import { BranchSettingsReader } from '../branches/settings/branch-settings.reader';

export const LOCK_TIME_KEY = 'attendance.lockTime';

/**
 * Whether a register day is past the branch lock (backendFlows §7.1): every
 * earlier day is, and today is once the school wall clock reaches `lockTime`.
 * After the lock a submitted register is LOCKED and changes need a correction.
 */
export function isPastLock(
  date: Date,
  lockTime: string,
  now = new Date(),
): boolean {
  const day = parseDate(schoolDate(now));
  if (date.getTime() !== day.getTime()) return date < day;
  return schoolTime(now) >= lockTime;
}

/** Reads the branch's `attendance.lockTime` and applies {@link isPastLock}. */
@Injectable()
export class RegisterLockPolicy {
  constructor(private readonly settings: BranchSettingsReader) {}

  lockTime(branchId: string): Promise<string> {
    return this.settings.get<string>(branchId, LOCK_TIME_KEY);
  }

  async isPastLock(
    branchId: string,
    date: Date,
    now = new Date(),
  ): Promise<boolean> {
    return isPastLock(date, await this.lockTime(branchId), now);
  }
}
