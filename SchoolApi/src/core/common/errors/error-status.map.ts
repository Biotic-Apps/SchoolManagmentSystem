import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-code.enum';

export const ERROR_STATUS: Record<ErrorCode, HttpStatus> = {
  [ErrorCode.BAD_REQUEST]: HttpStatus.BAD_REQUEST,
  [ErrorCode.VALIDATION_FAILED]: HttpStatus.BAD_REQUEST,
  [ErrorCode.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.SESSION_REVOKED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [ErrorCode.FORBIDDEN_SCOPE]: HttpStatus.FORBIDDEN,
  [ErrorCode.ACCOUNT_DISABLED]: HttpStatus.FORBIDDEN,
  [ErrorCode.PASSWORD_CHANGE_REQUIRED]: HttpStatus.FORBIDDEN,
  [ErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.CONFLICT]: HttpStatus.CONFLICT,
  [ErrorCode.SCHOOL_CODE_TAKEN]: HttpStatus.CONFLICT,
  [ErrorCode.USER_EMAIL_TAKEN]: HttpStatus.CONFLICT,
  [ErrorCode.USER_PHONE_TAKEN]: HttpStatus.CONFLICT,
  [ErrorCode.ALREADY_SUBMITTED]: HttpStatus.CONFLICT,
  [ErrorCode.PICKUP_NOT_AUTHORIZED]: HttpStatus.FORBIDDEN,
  [ErrorCode.CLEARANCE_REQUIRED]: HttpStatus.CONFLICT,
  [ErrorCode.GATEWAY_DISABLED]: HttpStatus.CONFLICT,
  [ErrorCode.DAY_CLOSED]: HttpStatus.LOCKED,
  [ErrorCode.NEGATIVE_STOCK]: HttpStatus.CONFLICT,
  [ErrorCode.RECORD_LOCKED]: HttpStatus.LOCKED,
  [ErrorCode.ACCOUNT_LOCKED]: HttpStatus.LOCKED,
  [ErrorCode.APPROVAL_REQUIRED]: HttpStatus.CONFLICT,
  [ErrorCode.PAYLOAD_TOO_LARGE]: HttpStatus.PAYLOAD_TOO_LARGE,
  [ErrorCode.RATE_LIMITED]: HttpStatus.TOO_MANY_REQUESTS,
  [ErrorCode.TWO_FACTOR_SETUP_REQUIRED]: HttpStatus.FORBIDDEN,
  [ErrorCode.FILE_UNAVAILABLE]: HttpStatus.GONE,
  [ErrorCode.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
};

const CODE_BY_STATUS: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHENTICATED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
  [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
  [HttpStatus.LOCKED]: ErrorCode.RECORD_LOCKED,
  [HttpStatus.PAYLOAD_TOO_LARGE]: ErrorCode.PAYLOAD_TOO_LARGE,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.RATE_LIMITED,
};

export function codeForStatus(status: number): ErrorCode {
  const known = CODE_BY_STATUS[status];
  if (known) return known;
  return status >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.BAD_REQUEST;
}
