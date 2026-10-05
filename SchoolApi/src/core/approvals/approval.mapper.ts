import type { ApprovalWithSteps } from './approvals.repository';
import type { ApprovalRequestDto } from './dto/approval-request.dto';

export function toApprovalDto(
  row: ApprovalWithSteps,
  withSteps: boolean,
): ApprovalRequestDto {
  return {
    id: row.id,
    type: row.type,
    entityType: row.entityType,
    entityId: row.entityId,
    branchId: row.branchId,
    title: row.title,
    amountMinor: row.amountMinor === null ? null : Number(row.amountMinor),
    requestedBy: row.requestedBy,
    status: row.status,
    currentStep: row.currentStep,
    createdAt: row.createdAt.toISOString(),
    ...(withSteps && {
      steps: row.steps.map((step) => ({
        order: step.order,
        approverRole: step.approverRole,
        approverUserId: step.approverUserId,
        amountLimitMinor:
          step.amountLimitMinor === null ? null : Number(step.amountLimitMinor),
        decision: step.decision,
        comment: step.comment,
        decidedAt: step.decidedAt?.toISOString() ?? null,
        decidedBy: step.decidedBy,
      })),
    }),
  };
}
