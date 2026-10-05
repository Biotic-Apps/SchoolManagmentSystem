import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code.enum';
import type { AuthenticatedRequest } from '../common/types/auth-user';
import type { PermissionKey } from './permission-catalogue';
import { REQUIRED_PERMISSIONS_KEY } from './require-permission.decorator';

/**
 * Permission part of the policy; `request.user` (permissions of the active
 * role) is set by JwtAuthGuard. Scope checks happen via Scope in services.
 */
@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (!user) {
      throw new AppError(ErrorCode.UNAUTHENTICATED, 'Not authenticated');
    }

    const required =
      this.reflector.getAllAndOverride<PermissionKey[]>(
        REQUIRED_PERMISSIONS_KEY,
        targets,
      ) ?? [];
    if (required.length === 0) return true;

    if (required.some((permission) => user.permissions.has(permission))) {
      return true;
    }
    throw new AppError(ErrorCode.FORBIDDEN, 'Permission denied', {
      required,
    });
  }
}
