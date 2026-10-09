import type { AuditService } from '../../../core/audit/audit.service';
import type { PasswordHasher } from '../../../core/auth/password/password-hasher';
import type { SessionsService } from '../../../core/auth/sessions/sessions.service';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { NotificationService } from '../../../core/notifications/notification.service';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { GuardianAccessService } from '../guardian-access.service';
import { GuardianAccountService } from './guardian-account.service';

const PRINCIPAL: AuthUser = {
  id: 'principal',
  sessionId: 's',
  tokenVersion: 0,
  activeRole: 'PRINCIPAL',
  roles: ['PRINCIPAL'],
  permissions: new Set(['guardians.edit', 'users.edit']),
  assignments: [],
};

const guardianRow = (over: Record<string, unknown> = {}) => ({
  id: 'g-1',
  userId: 'parent-1',
  name: 'Ahmed Khan',
  schoolId: 'school-1',
  ...over,
});

function setup(row = guardianRow()) {
  const prisma = {
    user: {
      update: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue({
        email: 'ahmed@example.pk',
        phone: '+923001234567',
        status: 'ACTIVE',
      }),
    },
    roleAssignment: { count: jest.fn().mockResolvedValue(0) },
  };
  const access = { manage: jest.fn().mockResolvedValue(row) };
  const hasher = { hash: jest.fn().mockResolvedValue('hashed') };
  const sessions = { revokeAllForUser: jest.fn() };
  const notifications = {
    sendDirect: jest.fn<Promise<void>, [{ userId: string; body: string }]>(),
  };
  const audit = { stage: jest.fn() };
  const service = new GuardianAccountService(
    prisma as unknown as PrismaService,
    access as unknown as GuardianAccessService,
    hasher as unknown as PasswordHasher,
    sessions as unknown as SessionsService,
    notifications as unknown as NotificationService,
    audit as unknown as AuditService,
  );
  return { service, prisma, sessions, notifications, audit };
}

const scope = {} as Scope;
const codeOf = (p: Promise<unknown>) =>
  p.then(
    () => 'resolved',
    (e: { code?: string }) => e.code,
  );

describe('GuardianAccountService.resetPassword', () => {
  it('sets a temporary password, forces a change and signs the parent out', async () => {
    const { service, prisma, sessions, audit } = setup();
    const result = await service.resetPassword(PRINCIPAL, scope, 'g-1');
    expect(result.userId).toBe('parent-1');
    expect(result.temporaryPassword).toHaveLength(12);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'parent-1' },
        data: expect.objectContaining({
          passwordHash: 'hashed',
          mustChangePassword: true,
          lockedUntil: null,
        }) as object,
      }),
    );
    expect(sessions.revokeAllForUser).toHaveBeenCalledWith('parent-1', {
      bumpTokenVersion: true,
    });
    expect(audit.stage).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'guardian.account_reset_password' }),
    );
  });

  it('needs users.edit', async () => {
    const { service } = setup();
    const user = { ...PRINCIPAL, permissions: new Set(['guardians.edit']) };
    expect(await codeOf(service.resetPassword(user, scope, 'g-1'))).toBe(
      ErrorCode.FORBIDDEN,
    );
  });

  it('refuses a guardian without a login', async () => {
    const { service } = setup(guardianRow({ userId: null }));
    expect(await codeOf(service.resetPassword(PRINCIPAL, scope, 'g-1'))).toBe(
      ErrorCode.VALIDATION_FAILED,
    );
  });

  it('refuses a login that also holds a staff role', async () => {
    const { service, prisma } = setup();
    prisma.roleAssignment.count.mockResolvedValue(1);
    expect(await codeOf(service.resetPassword(PRINCIPAL, scope, 'g-1'))).toBe(
      ErrorCode.FORBIDDEN,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

describe('GuardianAccountService.sendSignIn', () => {
  it('emails and texts sign-in steps without a password', async () => {
    const { service, notifications, audit } = setup();
    const result = await service.sendSignIn(PRINCIPAL, scope, 'g-1');
    expect(result.channels).toEqual(['EMAIL', 'SMS']);
    expect(notifications.sendDirect).toHaveBeenCalledTimes(2);
    const [sent] = notifications.sendDirect.mock.calls[0];
    expect(sent.userId).toBe('parent-1');
    expect(sent.body).toContain('Sign in with email code');
    expect(sent.body).toContain('ahmed@example.pk');
    expect(audit.stage).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'guardian.account_send_sign_in' }),
    );
  });

  it('only texts a login without email', async () => {
    const { service, prisma, notifications } = setup();
    prisma.user.findUnique.mockResolvedValue({
      email: null,
      phone: '+923001234567',
      status: 'ACTIVE',
    });
    const result = await service.sendSignIn(PRINCIPAL, scope, 'g-1');
    expect(result.channels).toEqual(['SMS']);
    const [sent] = notifications.sendDirect.mock.calls[0];
    expect(sent.body).not.toContain('email code');
  });

  it('refuses a disabled login', async () => {
    const { service, prisma } = setup();
    prisma.user.findUnique.mockResolvedValue({
      email: 'a@b.pk',
      phone: null,
      status: 'DISABLED',
    });
    expect(await codeOf(service.sendSignIn(PRINCIPAL, scope, 'g-1'))).toBe(
      ErrorCode.VALIDATION_FAILED,
    );
  });
});
