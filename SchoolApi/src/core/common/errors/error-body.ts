import { ErrorCode } from './error-code.enum';

export interface ErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export interface ResolvedError {
  status: number;
  body: ErrorBody;
}

export function errorBody(
  code: ErrorCode,
  message: string,
  details?: unknown,
): ErrorBody {
  return details === undefined
    ? { error: { code, message } }
    : { error: { code, message, details } };
}
