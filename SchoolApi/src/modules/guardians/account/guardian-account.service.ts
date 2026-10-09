import { AppConfigService } from '../../../config/app-config.service';
import { loginPageUrl } from '../../../config/public-web-url';
import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { PasswordHasher } from '../../../core/auth/password/password-hasher';
import { generateTemporaryPassword } from '../../../core/auth/password/temporary-password';
import { SessionsService } from '../../../core/auth/sessions/sessions.service';
import { forbidden, invalid } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { activeAssignmentWhere } from '../../users/active-assignment-where';
import type {
  GuardianPasswordResetDto,
  GuardianSignInSentDto,
} from '../dto/guardian.dto';
import { GuardianAccessService } from '../guardian-access.service';
import { signInInstructions } from './sign-in-instructions';

/** Staff help a parent sign in: a new temporary password, or emailed/SMS steps. */
@Injectable()
export class GuardianAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: GuardianAccessService,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionsService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
    private readonly config: AppConfigService,
  ) {}

  async resetPassword(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<GuardianPasswordResetDto> {
    if (!user.permissions.has('users.edit')) throw forbidden();
    const guardian = await this.access.manage(scope, id);
    const userId = loginOf(guardian.userId);
    if (userId === user.id)
      throw forbidden('Use password change for your own account');
    await this.assertParentOnly(userId);
    const temporaryPassword = generateTemporaryPassword();
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await this.hasher.hash(temporaryPassword),
        mustChangePassword: true,
        failedLoginCount: 0,
        lockedUntil: null,
        updatedById: user.id,
      },
    });
    await this.sessions.revokeAllForUser(userId, { bumpTokenVersion: true });
    this.audit.stage({
      action: 'guardian.account_reset_password',
      entityType: 'Guardian',
      entityId: id,
      schoolId: guardian.schoolId,
      after: { userId },
    });
    return { userId, temporaryPassword };
  }

  /** How and where to sign in; never a password (security.md §1). */
  async sendSignIn(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<GuardianSignInSentDto> {
    const guardian = await this.access.manage(scope, id);
    const userId = loginOf(guardian.userId);
    const login = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true, status: true },
    });
    if (!login || login.status !== 'ACTIVE')
      throw invalid('This parent login is not active');
    const message = signInInstructions(
      guardian.name,
      login,
      loginPageUrl(this.config),
    );
    const channels: GuardianSignInSentDto['channels'] = [];
    if (login.email) channels.push('EMAIL');
    if (login.phone) channels.push('SMS');
    for (const channel of channels) {
      const { extras, ...text } = message;
      await this.notifications.sendDirect({
        userId,
        channel,
        ...text,
        ...(channel === 'EMAIL' ? { extras } : {}),
      });
    }
    this.audit.stage({
      action: 'guardian.account_send_sign_in',
      entityType: 'Guardian',
      entityId: id,
      schoolId: guardian.schoolId,
      after: { userId, channels, sentById: user.id },
    });
    return { channels };
  }

  /** A login that is also staff/admin is reset from Users, not from here. */
  private async assertParentOnly(userId: string): Promise<void> {
    const other = await this.prisma.roleAssignment.count({
      where: {
        AND: [
          { userId },
          activeAssignmentWhere(),
          { role: { key: { not: RoleKey.PARENT } } },
        ],
      },
    });
    if (other > 0)
      throw forbidden(
        'This login is also used for staff work; reset it from Users',
      );
  }
}

function loginOf(userId: string | null): string {
  if (!userId) throw invalid('This guardian has no parent login yet');
  return userId;
}
