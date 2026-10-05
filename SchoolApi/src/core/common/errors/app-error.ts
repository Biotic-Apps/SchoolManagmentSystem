import { ErrorCode } from './error-code.enum';
import { ERROR_STATUS } from './error-status.map';

export class AppError extends Error {
  readonly status: number;

  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
    status?: number,
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status ?? ERROR_STATUS[code];
  }
}
