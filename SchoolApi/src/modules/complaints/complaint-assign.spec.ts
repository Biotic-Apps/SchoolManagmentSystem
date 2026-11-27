import type { AuditService } from '../../core/audit/audit.service';
import type { AuthUser } from '../../core/common/types/auth-user';
import type { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { ComplaintActionsService } from './complaint-actions.service';
import type { ComplaintAttachments } from './complaint-attachments';
import type { ComplaintEscalationService } from './complaint-escalation.service';
import type { ComplaintNotifier } from './complaint-notifier';
import type { ComplaintRouterService } from './complaint-router.service';

const PRINCIPAL = { id: 'p1', activeRole: 'PRINCIPAL' } as AuthUser;
const SCOPE = {
  guardian: null,
  sectionLimited: false,
  canManageBranch: () => true,
  canManageSchool: () => true,
} as unknown as Scope;

function setup(row: { status: string; assigneeId: string | null }) {
  const complaint = {
    id: 'c1',
    schoolId: 'sc',
    branchId: 'b',
    complainantId: 'parent',
    againstUserId: null,
    ...row,
  };
  const tx = {
    complaint: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findUniqueOrThrow: jest.fn().mockResolvedValue(complaint),
      findUnique: jest.fn().mockResolvedValue(complaint),
    },
    complaintUpdate: { create: jest.fn().mockResolvedValue({ id: 'u' }) },
  };
  const prisma = {
    complaint: { findUnique: jest.fn().mockResolvedValue(complaint) },
    user: {
      findFirst: jest.fn().mockResolvedValue({ id: 't1', name: 'Teacher' }),
    },
    $transaction: jest.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  const notifier = {
    statusChanged: jest.fn(),
    assigned: jest.fn(),
  };
  const attachments = { link: jest.fn(), attach: jest.fn() };
  const service = new ComplaintActionsService(
    prisma as unknown as PrismaService,
    {} as ComplaintRouterService,
    {} as ComplaintEscalationService,
    attachments as unknown as ComplaintAttachments,
    notifier as unknown as ComplaintNotifier,
    { stage: jest.fn() } as unknown as AuditService,
  );
  return { service, notifier, prisma };
}

describe('ComplaintActionsService.assign', () => {
  it('does nothing when the complaint is already assigned to that person', async () => {
    const { service, notifier, prisma } = setup({
      status: 'ASSIGNED',
      assigneeId: 't1',
    });
    await service.assign(PRINCIPAL, SCOPE, 'c1', { assigneeUserId: 't1' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(notifier.assigned).not.toHaveBeenCalled();
    expect(notifier.statusChanged).not.toHaveBeenCalled();
  });

  it('notifies a new assignee', async () => {
    const { service, notifier } = setup({
      status: 'SUBMITTED',
      assigneeId: null,
    });
    await service.assign(PRINCIPAL, SCOPE, 'c1', { assigneeUserId: 't1' });
    expect(notifier.assigned).toHaveBeenCalledWith(
      expect.anything(),
      't1',
      'p1',
    );
  });
});
