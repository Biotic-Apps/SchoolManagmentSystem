import { AppError } from '../../core/common/errors/app-error';
import { ErrorCode } from '../../core/common/errors/error-code.enum';

export const schoolCodeTaken = (code: string): AppError =>
  new AppError(
    ErrorCode.SCHOOL_CODE_TAKEN,
    `School code ${code} is already in use`,
  );

export const userEmailTaken = (): AppError =>
  new AppError(
    ErrorCode.USER_EMAIL_TAKEN,
    'An account with this email already exists',
  );

export const userPhoneTaken = (): AppError =>
  new AppError(
    ErrorCode.USER_PHONE_TAKEN,
    'An account with this phone already exists',
  );

const isUniqueViolation = (error: unknown): boolean =>
  (error as { code?: string }).code === 'P2002';

/** Maps a unique violation (P2002) to `mapped`, rethrows anything else. */
export function onUnique(mapped: () => AppError) {
  return (error: unknown): never => {
    if (isUniqueViolation(error)) throw mapped();
    throw error;
  };
}
