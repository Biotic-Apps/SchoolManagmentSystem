import { HttpException, HttpStatus } from '@nestjs/common';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';
import { ERROR_STATUS, codeForStatus } from '../errors/error-status.map';
import { errorBody, type ResolvedError } from '../errors/error-body';
import {
  isPrismaKnownError,
  mapPrismaError,
} from '../errors/prisma-error.mapper';

const INTERNAL: ResolvedError = {
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  body: errorBody(ErrorCode.INTERNAL_ERROR, 'Something went wrong'),
};

function fromHttpException(exception: HttpException): ResolvedError {
  const status = exception.getStatus();
  if (status >= 500) return INTERNAL;

  const response = exception.getResponse();
  const message: unknown =
    typeof response === 'string'
      ? response
      : (response as { message?: unknown }).message;

  if (status === 400 && Array.isArray(message)) {
    return {
      status,
      body: errorBody(
        ErrorCode.VALIDATION_FAILED,
        'Validation failed',
        message,
      ),
    };
  }

  const text = typeof message === 'string' ? message : exception.message;
  return { status, body: errorBody(codeForStatus(status), text) };
}

export function resolveError(exception: unknown): ResolvedError {
  if (exception instanceof AppError) {
    return {
      status: exception.status,
      body: errorBody(exception.code, exception.message, exception.details),
    };
  }
  if (exception instanceof HttpException) {
    return fromHttpException(exception);
  }
  if (isPrismaKnownError(exception)) {
    const mapped = mapPrismaError(exception);
    if (mapped) {
      return {
        status: ERROR_STATUS[mapped.code],
        body: errorBody(mapped.code, mapped.message),
      };
    }
  }
  return INTERNAL;
}
