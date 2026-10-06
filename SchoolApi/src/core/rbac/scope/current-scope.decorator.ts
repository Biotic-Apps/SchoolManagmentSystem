import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { AppError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-code.enum';
import type { AuthenticatedRequest } from '../../common/types/auth-user';
import { Scope } from './scope';
import { ScopeService } from './scope.service';

export const CurrentScope = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Scope => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new AppError(ErrorCode.UNAUTHENTICATED, 'Not authenticated');
    }
    return ScopeService.resolve(
      request.user.assignments,
      request.user.studentIds,
    );
  },
);
