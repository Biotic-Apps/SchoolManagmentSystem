import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { requestContext } from '../../common/context/request-context';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { AppError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-code.enum';
import type { AuthenticatedRequest } from '../../common/types/auth-user';
import { AccessContextService } from '../../rbac/access/access-context.service';
import { AuthStateCache } from '../auth-state.cache';
import { UserAuthPolicyService } from '../policy/user-auth-policy.service';
import { TokenService } from '../token.service';
import { ALLOW_PENDING_PASSWORD_KEY } from './allow-pending-password.decorator';

function bearerToken(
  header: string | string[] | undefined,
): string | undefined {
  if (typeof header !== 'string') return undefined;
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : undefined;
}

/** Verifies the access token and loads the active role context. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
    private readonly state: AuthStateCache,
    private readonly access: AccessContextService,
    private readonly policies: UserAuthPolicyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = bearerToken(request.headers.authorization);
    if (!token)
      throw new AppError(ErrorCode.UNAUTHENTICATED, 'Not authenticated');

    const claims = await this.tokens.verifyAccess(token);
    const state = await this.state.userState(claims.sub);
    if (!state)
      throw new AppError(ErrorCode.UNAUTHENTICATED, 'Not authenticated');
    if (state.status === 'DISABLED') {
      throw new AppError(ErrorCode.ACCOUNT_DISABLED, 'Account is disabled');
    }
    if (
      state.tokenVersion !== claims.ver ||
      !(await this.state.isFamilyActive(claims.sid))
    ) {
      throw new AppError(ErrorCode.SESSION_REVOKED, 'Session has been revoked');
    }
    const allowPending = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PENDING_PASSWORD_KEY,
      targets,
    );
    if (state.mustChangePassword && !allowPending) {
      throw new AppError(
        ErrorCode.PASSWORD_CHANGE_REQUIRED,
        'Change your password to continue',
      );
    }

    const header = request.headers['x-active-role'];
    const access = await this.access.resolve(
      claims.sub,
      typeof header === 'string' ? header.trim() : undefined,
    );
    // Same exemptions as a pending password change: /auth/* and /me.
    if (
      !allowPending &&
      !state.twoFactorEnabled &&
      (await this.policies.twoFactorRequired(claims.sub, access.allAssignments))
    ) {
      throw new AppError(
        ErrorCode.TWO_FACTOR_SETUP_REQUIRED,
        'Turn on two-factor sign-in to continue',
      );
    }
    request.user = {
      id: claims.sub,
      sessionId: claims.sid,
      tokenVersion: claims.ver,
      activeRole: access.activeRole,
      roles: access.roles,
      permissions: access.permissions,
      assignments: access.assignments,
      studentIds: access.studentIds,
    };
    const store = requestContext.getStore();
    if (store) store.actorId = claims.sub;
    return true;
  }
}
