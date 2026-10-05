import { AppError } from './app-error';
import { ErrorCode } from './error-code.enum';

export const notFound = (entity: string): AppError =>
  new AppError(ErrorCode.NOT_FOUND, `${entity} not found`);

export const forbidden = (message = 'Permission denied'): AppError =>
  new AppError(ErrorCode.FORBIDDEN, message);

export const forbiddenScope = (message = 'Outside your scope'): AppError =>
  new AppError(ErrorCode.FORBIDDEN_SCOPE, message);

export const conflict = (message: string, details?: unknown): AppError =>
  new AppError(ErrorCode.CONFLICT, message, details);

export const recordLocked = (message: string): AppError =>
  new AppError(ErrorCode.RECORD_LOCKED, message);

export const invalid = (message: string, details?: unknown): AppError =>
  new AppError(ErrorCode.VALIDATION_FAILED, message, details);
