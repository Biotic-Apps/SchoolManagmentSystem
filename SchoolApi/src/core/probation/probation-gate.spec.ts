import type { ApprovalService } from '../approvals/approval.service';
import type { AuditService } from '../audit/audit.service';
import type { NotificationService } from '../notifications/notification.service';
import type { PrismaService } from '../prisma/prisma.service';
import { ProbationActionRegistry } from './probation-action.registry';
import { ProbationGate } from './probation-gate';
import { ProbationReviewHandler } from './probation-review.handler';
import type { ApprovalHandlerRegistry } from '../approvals/approval-handler.registry';

const action = {
  key: 'test.action',
  entityType: 'Thing',
  entityId: 'thing-1',
  schoolId: 'school',
  branchId: 'branch',
  title: 'Change thing',
  payload: { value: 42 },
};

function setup(
  staff: {
    id: string;
    requiresReview: boolean;
    reviewerUserId: string | null;
  } | null,
) {
  const handler = {
    key: 'test.action',
    apply: jest.fn(),
    onHeld: jest.fn(),
    onDiscarded: jest.fn(),
  };
  const registry = new ProbationActionRegistry();
  registry.register(handler);
  const tx = {
    approvalStep: {
      findFirst: jest.fn().mockResolvedValue({ decidedById: 'reviewer' }),
    },
  };
  const prisma = {
    staff: { findUnique: jest.fn().mockResolvedValue(staff) },
    $transaction: (fn: (t: typeof tx) => Promise<unknown>) => fn(tx),
  };
  const approvals = {
    create: jest.fn().mockResolvedValue({ id: 'approval-1' }),
  };
  const notify = jest.fn();
  const gate = new ProbationGate(
    prisma as unknown as PrismaService,
    approvals as unknown as ApprovalService,
    registry,
    { notify } as unknown as NotificationService,
    { stage: jest.fn() } as unknown as AuditService,
  );
  return { gate, handler, approvals, notify, registry, tx };
}

describe('ProbationGate', () => {
  it('applies immediately when the actor is not on probation', async () => {
    const { gate, approvals } = setup({
      id: 's',
      requiresReview: false,
      reviewerUserId: null,
    });
    const apply = jest.fn().mockResolvedValue('done');
    const result = await gate.run({ userId: 'teacher' }, action, apply);
    expect(result).toEqual({
      status: 'APPLIED',
      approvalId: null,
      result: 'done',
    });
    expect(apply).toHaveBeenCalled();
    expect(approvals.create).not.toHaveBeenCalled();
  });

  it('applies immediately for users without a staff record (e.g. admins)', async () => {
    const { gate } = setup(null);
    const apply = jest.fn().mockResolvedValue(1);
    expect((await gate.run({ userId: 'admin' }, action, apply)).status).toBe(
      'APPLIED',
    );
  });

  it('holds the action for the reviewer when on probation', async () => {
    const { gate, approvals, handler, notify } = setup({
      id: 'staff-1',
      requiresReview: true,
      reviewerUserId: 'coordinator',
    });
    const apply = jest.fn();
    const result = await gate.run({ userId: 'teacher' }, action, apply);

    expect(result).toEqual({
      status: 'PENDING_REVIEW',
      approvalId: 'approval-1',
      result: null,
    });
    expect(apply).not.toHaveBeenCalled();
    const [input] = approvals.create.mock.calls[0] as [
      { type: string; steps: unknown[]; payload: unknown },
    ];
    expect(input.type).toBe('PROBATION_REVIEW');
    expect(input.steps).toEqual([{ approverUserId: 'coordinator' }]);
    expect(input.payload).toEqual({
      action: 'test.action',
      payload: { value: 42 },
      staffId: 'staff-1',
      onBehalfOfStaffId: 'staff-1',
    });
    expect(handler.onHeld).toHaveBeenCalledWith(
      { value: 42 },
      'approval-1',
      expect.anything(),
    );
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ userIds: ['coordinator'] }),
    );
  });

  it('replays the held action as the reviewer on behalf of the teacher', async () => {
    const { registry, handler, tx } = setup(null);
    const review = new ProbationReviewHandler(
      { register: jest.fn() } as unknown as ApprovalHandlerRegistry,
      registry,
    );
    const request = {
      id: 'approval-1',
      requestedById: 'teacher',
      payload: {
        action: 'test.action',
        payload: { value: 42 },
        staffId: 'staff-1',
        onBehalfOfStaffId: 'staff-1',
      },
    };
    await review.onApproved(request as never, tx as never);
    expect(handler.apply).toHaveBeenCalledWith(
      { value: 42 },
      { performedById: 'reviewer', onBehalfOfStaffId: 'staff-1' },
      tx,
    );
    await review.onRejected(request as never, tx as never);
    expect(handler.onDiscarded).toHaveBeenCalledWith({ value: 42 }, tx);
  });
});
