import type { AccountProvisioner } from '../../../core/accounts/account-provisioner';
import type { AuditService } from '../../../core/audit/audit.service';
import type { PasswordPolicyService } from '../../../core/auth/password/password-policy.service';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { UsersService } from '../../users/users.service';
import type { StaffAccessService } from '../staff-access.service';
import { StaffAccountService } from './staff-account.service';

const PRINCIPAL: AuthUser = {
  id: 'principal',
  sessionId: 's',
  tokenVersion: 0,
  activeRole: 'PRINCIPAL',
  roles: ['PRINCIPAL'],
  permissions: new Set(['staff.edit', 'users.add', 'users.edit']),
  assignments: [],
};

const staffRow = (over: Record<string, unknown> = {}) => ({
  id: 'staff-1',
  userId: null,
  name: 'T Ayesha',
  email: 'ayesha@example.pk',
  phone: '+923001234567',
  designation: 'HELPER',
  schoolId: 'school-1',
  branchId: 'branch-1',
  ...over,
});

function setup(row = staffRow()) {
  const tx = {
    staff: {
      count: jest.fn().mockResolvedValue(0),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };
  const prisma = {
    $transaction: jest.fn((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  };
  const access = { manage: jest.fn().mockResolvedValue(row) };
  const accounts = {
    provision: jest.fn().mockResolvedValue({
      userId: 'user-1',
      temporaryPassword: 'Temp1234x',
      created: true,
    }),
    refresh: jest.fn(),
  };
  const policy = { assertForSchools: jest.fn() };
  const users = {
    resetPassword: jest
      .fn()
      .mockResolvedValue({ temporaryPassword: 'New1234x' }),
  };
  const audit = { stage: jest.fn() };
  const service = new StaffAccountService(
    prisma as unknown as PrismaService,
    access as unknown as StaffAccessService,
    accounts as unknown as AccountProvisioner,
    policy as unknown as PasswordPolicyService,
    users as unknown as UsersService,
    audit as unknown as AuditService,
  );
  return { service, tx, access, accounts, policy, users, audit };
}

const scope = {} as Scope;
const codeOf = (p: Promise<unknown>) =>
  p.then(
    () => 'resolved',
    (e: { code?: string }) => e.code,
  );

describe('StaffAccountService.create', () => {
  it('prefills contact from the staff record and defaults role from designation', async () => {
    const { service, accounts, tx, audit } = setup();
    const result = await service.create(PRINCIPAL, scope, 'staff-1', {});
    expect(accounts.provision).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        email: 'ayesha@example.pk',
        phone: '+923001234567',
        roleKey: 'HELPER',
        scopeType: 'BRANCH',
        branchId: 'branch-1',
        schoolId: 'school-1',
      }),
    );
    expect(tx.staff.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'staff-1', userId: null },
        data: expect.objectContaining({ userId: 'user-1' }) as unknown,
      }),
    );
    expect(accounts.refresh).toHaveBeenCalledWith('user-1');
    expect(audit.stage).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'staff.account.create' }),
    );
    expect(result).toEqual({
      userId: 'user-1',
      email: 'ayesha@example.pk',
      phone: '+923001234567',
      temporaryPassword: 'Temp1234x',
    });
  });

  it('uses the given role and checks an admin-chosen password', async () => {
    const { service, accounts, policy } = setup();
    accounts.provision.mockResolvedValue({
      userId: 'user-1',
      temporaryPassword: null,
      created: true,
    });
    const result = await service.create(PRINCIPAL, scope, 'staff-1', {
      roleKey: 'TEACHER',
      password: 'Chosen1234x',
    });
    expect(policy.assertForSchools).toHaveBeenCalledWith(
      ['school-1'],
      'Chosen1234x',
    );
    expect(accounts.provision).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ roleKey: 'TEACHER', password: 'Chosen1234x' }),
    );
    expect(result.temporaryPassword).toBeUndefined();
  });

  it('rejects a staff member who already has a login', async () => {
    const { service, accounts } = setup(staffRow({ userId: 'u-9' }));
    expect(await codeOf(service.create(PRINCIPAL, scope, 'staff-1', {}))).toBe(
      ErrorCode.CONFLICT,
    );
    expect(accounts.provision).not.toHaveBeenCalled();
  });

  it('rejects a login that already belongs to another staff record', async () => {
    const { service, tx } = setup();
    tx.staff.count.mockResolvedValue(1);
    expect(await codeOf(service.create(PRINCIPAL, scope, 'staff-1', {}))).toBe(
      ErrorCode.CONFLICT,
    );
    expect(tx.staff.updateMany).not.toHaveBeenCalled();
  });

  it('needs an email or phone', async () => {
    const { service } = setup(staffRow({ email: null, phone: null }));
    expect(await codeOf(service.create(PRINCIPAL, scope, 'staff-1', {}))).toBe(
      ErrorCode.VALIDATION_FAILED,
    );
  });

  it('needs users.add', async () => {
    const { service } = setup();
    const user = { ...PRINCIPAL, permissions: new Set(['staff.edit']) };
    expect(await codeOf(service.create(user, scope, 'staff-1', {}))).toBe(
      ErrorCode.FORBIDDEN,
    );
  });
});

describe('StaffAccountService.resetPassword', () => {
  it('delegates to the users reset for the linked login', async () => {
    const { service, users } = setup(staffRow({ userId: 'user-1' }));
    const result = await service.resetPassword(PRINCIPAL, scope, 'staff-1');
    expect(users.resetPassword).toHaveBeenCalledWith(
      PRINCIPAL,
      scope,
      'user-1',
    );
    expect(result).toEqual({ userId: 'user-1', temporaryPassword: 'New1234x' });
  });

  it('rejects a staff member without a login', async () => {
    const { service, users } = setup();
    expect(
      await codeOf(service.resetPassword(PRINCIPAL, scope, 'staff-1')),
    ).toBe(ErrorCode.VALIDATION_FAILED);
    expect(users.resetPassword).not.toHaveBeenCalled();
  });
});
