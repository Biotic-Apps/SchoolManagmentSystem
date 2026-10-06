import { Injectable } from '@nestjs/common';
import type { ApprovalType, Prisma } from '../../generated/prisma/client';
import { AuditService } from '../audit/audit.service';
import { forbidden, notFound } from '../common/errors/errors';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code.enum';
import { toJson } from '../common/prisma-json';
import type { AuthUser } from '../common/types/auth-user';
import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import type { Scope } from '../rbac/scope/scope';
import { canDecideStep } from './approval-access';
import { ApprovalHandlerRegistry } from './approval-handler.registry';
import { nextTransition } from './approval-transition';
import {
  ApprovalsRepository,
  type ApprovalWithSteps,
} from './approvals.repository';
import type { DecideApprovalDto } from './dto/decide-approval.dto';

export interface ApprovalStepInput {
  approverRole?: string;
  approverUserId?: string;
  amountLimitMinor?: bigint;
}

export interface CreateApprovalInput {
  type: ApprovalType;
  entityType: string;
  entityId: string;
  schoolId: string;
  branchId?: string | null;
  requestedById: string;
  title: string;
  payload: unknown;
  reason?: string;
  amountMinor?: bigint;
  steps: ApprovalStepInput[];
}

/** Generic engine: modules create requests; deciders act from one inbox. */
@Injectable()
export class ApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ApprovalsRepository,
    private readonly handlers: ApprovalHandlerRegistry,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async create(
    input: CreateApprovalInput,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    if (!this.handlers.has(input.type, input.entityType))
      throw new Error(`No handler for ${input.type}`);
    if (input.steps.length === 0)
      throw new Error('Approval needs at least one step');
    if (input.steps.some((s) => s.approverUserId === input.requestedById)) {
      throw forbidden('Requester cannot be an approver of their own request');
    }
    return tx.approvalRequest.create({
      data: {
        type: input.type,
        entityType: input.entityType,
        entityId: input.entityId,
        schoolId: input.schoolId,
        branchId: input.branchId ?? null,
        requestedById: input.requestedById,
        title: input.title,
        payload: toJson(input.payload),
        reason: input.reason,
        amountMinor: input.amountMinor,
        steps: {
          create: input.steps.map((step, index) => ({
            order: index + 1,
            approverRole: step.approverRole,
            approverUserId: step.approverUserId,
            amountLimitMinor: step.amountLimitMinor,
          })),
        },
      },
    });
  }

  async get(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<ApprovalWithSteps> {
    const request = await this.repository.findById(id);
    if (!request || !this.canSee(request, user, scope))
      throw notFound('Approval request');
    return request;
  }

  async decide(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: DecideApprovalDto,
  ) {
    const request = await this.get(user, scope, id);
    if (request.status !== 'PENDING') {
      throw new AppError(ErrorCode.CONFLICT, 'Request is no longer pending');
    }
    if (request.requestedById === user.id)
      throw forbidden('You cannot decide your own request');
    const step = request.steps.find((s) => s.order === request.currentStep);
    const decider = { userId: user.id, activeRole: user.activeRole, scope };
    if (!step || !canDecideStep(step, request, decider)) {
      throw forbidden('This request is not awaiting your decision');
    }
    await this.record(user.id, request, step.id, dto);
    return this.get(user, scope, id);
  }

  /**
   * For modules that authorise the decider themselves (e.g. a class teacher
   * deciding leave): records the decision on the current step and runs the
   * handler, like `decide`.
   */
  async decideAuthorized(
    userId: string,
    id: string,
    dto: DecideApprovalDto,
  ): Promise<void> {
    const request = await this.repository.findById(id);
    if (!request) throw notFound('Approval request');
    if (request.status !== 'PENDING') {
      throw new AppError(ErrorCode.CONFLICT, 'Request is no longer pending');
    }
    if (request.requestedById === userId)
      throw forbidden('You cannot decide your own request');
    const step = request.steps.find((s) => s.order === request.currentStep);
    if (!step) throw forbidden('This request is not awaiting a decision');
    await this.record(userId, request, step.id, dto);
  }

  private async record(
    userId: string,
    request: ApprovalWithSteps,
    stepId: string,
    dto: DecideApprovalDto,
  ): Promise<void> {
    const id = request.id;
    const next = nextTransition(
      request.steps,
      request.currentStep,
      dto.decision,
      request.amountMinor,
    );

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.approvalRequest.updateMany({
        where: { id, version: request.version, status: 'PENDING' },
        data: {
          status: next.status,
          currentStep: next.currentStep,
          decidedAt: next.status === 'PENDING' ? null : new Date(),
          version: { increment: 1 },
        },
      });
      if (updated.count === 0)
        throw new AppError(ErrorCode.CONFLICT, 'Request changed, reload');
      await tx.approvalStep.update({
        where: { id: stepId },
        data: {
          decision: dto.decision,
          comment: dto.comment,
          decidedById: userId,
          decidedAt: new Date(),
        },
      });
      await this.runHandler(id, next.status, tx);
    });

    this.audit.stage({
      action: `approval.${dto.decision.toLowerCase()}`,
      entityType: 'ApprovalRequest',
      entityId: id,
      schoolId: request.schoolId,
      branchId: request.branchId,
      before: { status: request.status, currentStep: request.currentStep },
      after: { ...next, comment: dto.comment },
    });
    await this.notifications.notify({
      userIds: [request.requestedById],
      category: 'APPROVAL',
      title: `${request.title}: ${next.status.toLowerCase()}`,
      body: dto.comment ?? `Your request was ${dto.decision.toLowerCase()}.`,
      data: { approvalId: id },
    });
  }

  private async runHandler(
    id: string,
    status: string,
    tx: Prisma.TransactionClient,
  ) {
    if (status === 'PENDING') return;
    const request = await tx.approvalRequest.findUniqueOrThrow({
      where: { id },
    });
    const handler = this.handlers.get(request.type, request.entityType);
    if (status === 'APPROVED') await handler.onApproved(request, tx);
    else if (status === 'REJECTED') await handler.onRejected(request, tx);
    else if (status === 'RETURNED') await handler.onReturned?.(request, tx);
  }

  private canSee(
    request: ApprovalWithSteps,
    user: AuthUser,
    scope: Scope,
  ): boolean {
    if (request.requestedById === user.id) return true;
    const decider = { userId: user.id, activeRole: user.activeRole, scope };
    return request.steps.some((step) => canDecideStep(step, request, decider));
  }
}
