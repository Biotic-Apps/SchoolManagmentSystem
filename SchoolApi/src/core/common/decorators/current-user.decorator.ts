import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';
import type { AuthUser, AuthenticatedRequest } from '../types/auth-user';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new AppError(ErrorCode.UNAUTHENTICATED, 'Not authenticated');
    }
    return request.user;
  },
);
