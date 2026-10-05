import type { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../common/errors/error-code.enum';
import type { AuthUser } from '../common/types/auth-user';
import type { NotificationService } from '../notifications/notification.service';
import type { PrismaService } from '../prisma/prisma.service';
import { ScopeService } from '../rbac/scope/scope.service';
import type { ApprovalHandler } from './approval-handler';
import { ApprovalHandlerRegistry } from './approval-handler.registry';
import { ApprovalService } from './approval.service';
import type { ApprovalsRepository } from './approvals.repository';

const principal: AuthUser = {
  id: 'principal',
  sessionId: 's',
  tokenVersion: 0,
  activeRole: 'PRINCIPAL',
  roles: ['PRINCIPAL'],
  permissions: new Set(['approvals.approve']),
  assignments: [
    {
      id: 'a',
      roleId: 'r',
      roleKey: 'PRINCIPAL',
      roleName: 'Principal',
      scopeType: 'BRANCH',
      schoolId: 'school',
      schoolName: null,
      branchId: 'branch',
      branchName: null,
      sectionId: null,
      subjectId: null,
      validFrom: new Date(0).toISOString(),
      validUntil: null,
    },
  ],
};
const scope = ScopeService.resolve(principal.assignments);

const request = (overrides = {}) => ({
  id: 'req',
  type: 'LEAVE',
  schoolId: 'school',
  branchId: 'branch',
  requestedById: 'teacher',
  status: 'PENDING',
  currentStep: 1,
  version: 0,
  amountMinor: null,
  title: 'Leave',
  steps: [
    {
      id: 'step1',
      order: 1,
      approverRole: 'PRINCIPAL',
      approverUserId: null,
      amountLimitMinor: null,
    },
  ],
  ...overrides,
});

function setup(found: ReturnType<typeof request>) {
  const onApproved = jest.fn();
  const onRejected = jest.fn();
  const handler: ApprovalHandler = { type: 'LEAVE', onApproved, onRejected };
  const registry = new ApprovalHandlerRegistry();
  registry.register(handler);
  const tx = {
    approvalRequest: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findUniqueOrThrow: jest.fn().mockResolvedValue(found),
    },
    approvalStep: { update: jest.fn() },
  };
  const prisma = {
    $transaction: (fn: (t: typeof tx) => Promise<unknown>) => fn(tx),
  };
  const repository = { findById: jest.fn().mockResolvedValue(found) };
  const notify = jest.fn();
  const service = new ApprovalService(
    prisma as unknown as PrismaService,
    repository as unknown as ApprovalsRepository,
    registry,
    { notify } as unknown as NotificationService,
    { stage: jest.fn() } as unknown as AuditService,
  );
  return { service, onApproved, onRejected, tx, notify };
}

const codeOf = (promise: Promise<unknown>) =>
  promise.then(
    () => 'resolved',
    (error: { code?: string }) => error.code,
  );

describe('ApprovalService.decide', () => {
  it('approves through the registered handler and notifies the requester', async () => {
    const { service, onApproved, tx, notify } = setup(request());
    await service.decide(principal, scope, 'req', { decision: 'APPROVED' });

    const [update] = tx.approvalRequest.updateMany.mock.calls[0] as [
      { data: { status: string } },
    ];
    expect(update.data.status).toBe('APPROVED');
    expect(onApproved).toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ userIds: ['teacher'] }),
    );
  });

  it('blocks self-approval', async () => {
    const { service, onApproved } = setup(
      request({ requestedById: 'principal' }),
    );
    expect(
      await codeOf(
        service.decide(principal, scope, 'req', { decision: 'APPROVED' }),
      ),
    ).toBe(ErrorCode.FORBIDDEN);
    expect(onApproved).not.toHaveBeenCalled();
  });

  it('hides requests from users who cannot decide them', async () => {
    const other = request({ branchId: 'other-branch' });
    const { service } = setup(other);
    expect(
      await codeOf(
        service.decide(principal, scope, 'req', { decision: 'APPROVED' }),
      ),
    ).toBe(ErrorCode.NOT_FOUND);
  });

  it('refuses decisions on requests that are no longer pending', async () => {
    const { service } = setup(request({ status: 'APPROVED' }));
    expect(
      await codeOf(
        service.decide(principal, scope, 'req', { decision: 'REJECTED' }),
      ),
    ).toBe(ErrorCode.CONFLICT);
  });

  it('calls onRejected on rejection', async () => {
    const { service, onRejected } = setup(request());
    await service.decide(principal, scope, 'req', {
      decision: 'REJECTED',
      comment: 'No',
    });
    expect(onRejected).toHaveBeenCalled();
  });
});
